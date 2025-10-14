/**
 * Inngest Function : Envoi automatique de l'email de bienvenue
 * Déclenché automatiquement à la création d'un utilisateur
 */

import { inngest } from '#shared/functions/inngest.serve'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type EmailService from '#mailing/services/email_service'
import type UserRepository from '#users/repositories/user_repository'
import logger from '@adonisjs/core/services/logger'

export const userWelcomeEmail = inngest.createFunction(
  {
    id: 'user-welcome-email',
    name: 'Send Welcome Email on User Creation',
    retries: 3,
    rateLimit: {
      limit: 50,
      period: '1m', // Max 50 welcome emails par minute
    },
  },
  { event: 'user/created' },
  async ({ event, step }) => {
    const { record: user } = event.data

    logger.info('Sending welcome email to new user', {
      userId: user.id,
      email: user.email,
    })

    // Step 1: Vérifier que l'utilisateur existe toujours
    const userExists = await step.run('check-user-exists', async () => {
      const userRepo = getService<UserRepository>(TYPES.UserRepository)
      const existingUser = await userRepo.findById(user.id)
      return !!existingUser
    })

    if (!userExists) {
      logger.warn('User no longer exists, skipping welcome email', {
        userId: user.id,
      })
      return { skipped: true, reason: 'User deleted' }
    }

    // Step 2: Envoyer l'email de bienvenue
    await step.run('send-welcome-email', async () => {
      const emailService = getService<EmailService>(TYPES.EmailService)

      await emailService.sendWelcomeEmail(user.email, {
        userName: user.fullName || user.email.split('@')[0],
        loginUrl: `${process.env.APP_URL || 'http://localhost:3333'}/login`,
      })

      logger.info('Welcome email sent successfully', {
        userId: user.id,
        email: user.email,
      })
    })

    return {
      success: true,
      userId: user.id,
      email: user.email,
    }
  }
)
