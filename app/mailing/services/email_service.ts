import { injectable, inject } from 'inversify'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import env from '#start/env'
import { TYPES } from '#shared/container/types'
import type InngestService from '#shared/services/inngest_service'
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

  constructor(@inject(TYPES.InngestService) private inngestService: InngestService) {
    this.resend = new Resend(env.get('RESEND_API_KEY'))
  }

  async send(emailData: SendEmailData): Promise<EmailResult> {
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

      return {
        id: result.data!.id,
        success: true,
      }
    } catch (error) {
      return {
        id: '',
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Queue email via Inngest (async, reliable, with retries)
   * Note: The actual sending is done by Inngest function
   */
  async queue(
    emailData: QueueEmailData,
    options?: { priority?: string; delay?: number }
  ): Promise<void> {
    // Dispatch vers Inngest au lieu de Bull
    // L'envoi réel sera géré par une Inngest function
    await this.inngestService.send({
      name: 'email/send-queued' as any,
      data: {
        emailData,
        options,
      },
    })
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
    await this.queue({
      to,
      subject: 'Bienvenue sur notre plateforme !',
      react: WelcomeEmail(data),
      tags: {
        category: 'welcome',
      },
      priority: 'normal',
    })
  }

  async queuePasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<void> {
    const { default: PasswordResetEmail } = await import(
      '../../../inertia/emails/password_reset_email.js'
    )
    await this.queue({
      to,
      subject: 'Réinitialisation de votre mot de passe',
      react: PasswordResetEmail(data),
      tags: {
        category: 'password-reset',
      },
      priority: 'high',
    })
  }
}
