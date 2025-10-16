import { injectable, inject } from 'inversify'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import env from '#start/env'
import { TYPES } from '#shared/container/types'
import type QueueService from '#shared/services/queue_service'
import type EmailLogRepository from '#mailing/repositories/email_log_repository'
import type {
  SendEmailData,
  EmailResult,
  WelcomeEmailData,
  PasswordResetEmailData,
  QueueEmailData,
} from '#mailing/types/email'

@injectable()
export default class EmailService {
  private resend: Resend

  constructor(
    @inject(TYPES.QueueService) private queueService: QueueService,
    @inject(TYPES.EmailLogRepository) private emailLogRepo: EmailLogRepository
  ) {
    this.resend = new Resend(env.get('RESEND_API_KEY'))
  }

  async send(emailData: SendEmailData, userId?: string): Promise<EmailResult> {
    const recipient = Array.isArray(emailData.to)
      ? emailData.to[0]
      : typeof emailData.to === 'string'
        ? emailData.to
        : emailData.to.email

    const category = emailData.tags?.category || 'general'

    const attachmentsMetadata =
      emailData.attachments?.map((att) => ({
        filename: att.filename,
        contentType: att.contentType || 'application/octet-stream',
        size: Buffer.isBuffer(att.content) ? att.content.length : undefined,
      })) || null

    const metadata = {
      tags: emailData.tags || {},
      cc: emailData.cc,
      bcc: emailData.bcc,
      replyTo: emailData.replyTo,
    }

    const log = await this.emailLogRepo.create({
      userId: userId || null,
      recipient,
      subject: emailData.subject,
      category,
      status: 'pending',
      metadata,
      attachmentsMetadata,
    })

    try {
      let html = emailData.html

      if (emailData.react) {
        html = await render(emailData.react)
      }

      const result = await this.resend.emails.send({
        from: `${env.get('EMAIL_FROM_NAME')} <${env.get('EMAIL_FROM_ADDRESS')}>`,
        to: emailData.to,
        subject: emailData.subject,
        html,
        text: emailData.text,
        reply_to: emailData.replyTo,
        cc: emailData.cc,
        bcc: emailData.bcc,
        attachments: emailData.attachments,
        tags: emailData.tags,
      } as any)

      if (result.error) {
        throw new Error(result.error.message)
      }

      await this.emailLogRepo.updateStatus(log.id, 'sent')
      await this.emailLogRepo.update(log.id, { provider_id: result.data!.id } as any)

      return {
        id: result.data!.id,
        success: true,
      }
    } catch (error) {
      await this.emailLogRepo.updateStatus(log.id, 'failed')
      await this.emailLogRepo.update(log.id, { error_message: error.message } as any)

      return {
        id: '',
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Queue email via Bull (async, reliable, with retries)
   */
  async queue(
    emailData: QueueEmailData,
    options?: { priority?: number; delay?: number }
  ): Promise<void> {
    await this.queueService.add(
      'emails',
      'send-email',
      { emailData },
      {
        priority: options?.priority,
        delay: options?.delay,
      }
    )
  }

  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<EmailResult> {
    const { default: WelcomeEmail } = await import('../../../inertia/emails/welcome_email.js')
    return this.send({
      to,
      subject: 'Bienvenue sur notre plateforme !',
      react: WelcomeEmail(data),
      tags: {
        category: 'welcome',
      },
    })
  }

  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<EmailResult> {
    const { default: PasswordResetEmail } = await import(
      '../../../inertia/emails/password_reset_email.js'
    )
    return this.send({
      to,
      subject: 'Réinitialisation de votre mot de passe',
      react: PasswordResetEmail(data),
      tags: {
        category: 'password-reset',
      },
    })
  }

  async queueWelcomeEmail(to: string, data: WelcomeEmailData): Promise<void> {
    const { default: WelcomeEmail } = await import('../../../inertia/emails/welcome_email.js')
    await this.queue(
      {
        to,
        subject: 'Bienvenue sur notre plateforme !',
        react: WelcomeEmail(data),
        tags: {
          category: 'welcome',
        },
      },
      { priority: 0 }
    )
  }

  async queuePasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<void> {
    const { default: PasswordResetEmail } = await import(
      '../../../inertia/emails/password_reset_email.js'
    )
    await this.queue(
      {
        to,
        subject: 'Réinitialisation de votre mot de passe',
        react: PasswordResetEmail(data),
        tags: {
          category: 'password-reset',
        },
      },
      { priority: 1 }
    )
  }
}
