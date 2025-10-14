/**
 * Inngest Function : Envoi d'emails en queue
 * Traite les événements email/send-queued avec retry automatique
 */

import { inngest } from '#shared/functions/inngest.serve'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type EmailService from '#mailing/services/email_service'
import logger from '@adonisjs/core/services/logger'

export const sendEmailFunction = inngest.createFunction(
  {
    id: 'send-email',
    name: 'Send Email',
    retries: 3,
    rateLimit: {
      limit: 100,
      period: '1m', // Max 100 emails par minute (Resend limits)
    },
  },
  { event: 'email/send-queued' },
  async ({ event, step }) => {
    const { emailData } = event.data

    // Step : Send email with automatic retry
    const result = await step.run('send-email', async () => {
      const emailService = getService<EmailService>(TYPES.EmailService)

      logger.info('Sending email via Inngest', {
        to: emailData.to,
        subject: emailData.subject,
      })

      const sendResult = await emailService.send(emailData)

      if (!sendResult.success) {
        throw new Error(`Failed to send email: ${sendResult.error}`)
      }

      return {
        id: sendResult.id,
        to: emailData.to,
        subject: emailData.subject,
      }
    })

    logger.info('Email sent successfully', result)

    return {
      success: true,
      emailId: result.id,
    }
  }
)
