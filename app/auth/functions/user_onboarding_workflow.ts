/**
 * Inngest Function : Workflow d'onboarding multi-jours
 * Séquence automatique d'emails et notifications après inscription
 */

import { inngest } from '#shared/functions/inngest.serve'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type EmailService from '#mailing/services/email_service'
import type NotificationService from '#notifications/services/notification_service'
import logger from '@adonisjs/core/services/logger'

export const userOnboardingWorkflow = inngest.createFunction(
  {
    id: 'user-onboarding-workflow',
    name: 'User Onboarding Multi-Day Workflow',
    retries: 3,
  },
  { event: 'user/created' },
  async ({ event, step }) => {
    const { record: user } = event.data

    logger.info('Starting onboarding workflow', {
      userId: user.id,
      email: user.email,
    })

    // ==========================================
    // JOUR 0 : Immédiat (déjà géré par userWelcomeEmail)
    // ==========================================

    // ==========================================
    // JOUR 1 : Tips & Tricks
    // ==========================================
    await step.sleep('wait-1-day', '1d')

    await step.run('send-onboarding-tips', async () => {
      const notificationService = getService<NotificationService>(TYPES.NotificationService)

      await notificationService.create({
        userId: user.id,
        type: 'info',
        title: '💡 Astuce du jour',
        message: 'Découvrez comment tirer le meilleur parti de notre plateforme',
        actionUrl: '/onboarding/tips',
        actionLabel: 'Voir les astuces',
      })

      logger.info('Day 1: Tips notification sent', { userId: user.id })
    })

    // ==========================================
    // JOUR 3 : Check progress
    // ==========================================
    await step.sleep('wait-2-more-days', '2d')

    await step.run('check-onboarding-progress', async () => {
      // TODO: Vérifier si l'utilisateur a complété certaines actions
      // Si pas d'activité → envoyer un rappel

      const notificationService = getService<NotificationService>(TYPES.NotificationService)

      await notificationService.create({
        userId: user.id,
        type: 'info',
        title: '🚀 Besoin d\'aide pour démarrer ?',
        message: 'Notre équipe est là pour vous accompagner',
        actionUrl: '/help',
        actionLabel: 'Obtenir de l\'aide',
      })

      logger.info('Day 3: Progress check notification sent', { userId: user.id })
    })

    // ==========================================
    // JOUR 7 : Feedback Request
    // ==========================================
    await step.sleep('wait-4-more-days', '4d')

    await step.run('request-feedback', async () => {
      const notificationService = getService<NotificationService>(TYPES.NotificationService)

      await notificationService.create({
        userId: user.id,
        type: 'info',
        title: '⭐ Comment trouvez-vous votre expérience ?',
        message: 'Aidez-nous à améliorer notre service en 2 minutes',
        actionUrl: '/feedback',
        actionLabel: 'Donner mon avis',
      })

      logger.info('Day 7: Feedback request sent', { userId: user.id })
    })

    return {
      success: true,
      userId: user.id,
      completedSteps: 3,
    }
  }
)
