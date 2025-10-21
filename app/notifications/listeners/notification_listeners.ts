import { injectable, inject } from 'inversify'
import { TYPES } from '#shared/container/types'
import { getService } from '#shared/container/container'
import NotificationService from '#notifications/services/notification_service'
import EventBusService, { type EventHandler } from '#shared/services/event_bus_service'
import type {
  UserCreatedEvent,
  OrganizationInvitationCreatedEvent,
  SubscriptionCreatedEvent,
} from '#notifications/types/events'
import type UserRepository from '#users/repositories/user_repository'
import logger from '@adonisjs/core/services/logger'

/**
 * NotificationListeners - Écoute les événements domaine et crée des notifications
 *
 * Architecture:
 * - Écoute les événements du EventBus (sync/async)
 * - Crée automatiquement des notifications via NotificationService
 * - Gère les erreurs sans bloquer les workflows
 */
@injectable()
export default class NotificationListeners {
  private handlers: Map<string, EventHandler> = new Map()

  constructor(
    @inject(TYPES.NotificationService) private notificationService: NotificationService,
    @inject(TYPES.EventBus) private eventBus: EventBusService
  ) {}

  /**
   * Enregistrer tous les listeners
   */
  register(): void {
    this.registerUserCreatedListener()
    this.registerOrganizationInvitationCreatedListener()
    this.registerSubscriptionCreatedListener()

    logger.info('✅ Notification listeners registered')
  }

  /**
   * Désinscrire tous les listeners
   */
  unregisterAll(): void {
    for (const [eventName, handler] of this.handlers.entries()) {
      this.eventBus.off(eventName, handler)
    }
    this.handlers.clear()
    logger.info('🔕 Notification listeners unregistered')
  }

  /**
   * Helper pour enregistrer un handler et le tracker
   */
  private registerHandler(eventName: string, handler: EventHandler): void {
    this.handlers.set(eventName, handler)
    this.eventBus.on(eventName, handler)
  }

  /**
   * Listener: user.created → Notification de bienvenue
   */
  private registerUserCreatedListener(): void {
    const handler: EventHandler<UserCreatedEvent> = async (data) => {
      try {
        const { record: user } = data

        if (!user || !user.id) {
          logger.warn('user.created event received with incomplete data')
          return
        }

        await this.notificationService.createNotification({
          userId: user.id,
          type: 'system.announcement',
          titleI18n: {
            fr: '👋 Bienvenue !',
            en: '👋 Welcome!',
          },
          messageI18n: {
            fr: `Bienvenue ${user.fullName || user.email} ! Votre compte a été créé avec succès.`,
            en: `Welcome ${user.fullName || user.email}! Your account has been successfully created.`,
          },
          data: {
            userId: user.id,
            createdAt: user.createdAt?.toISO() || new Date().toISOString(),
          },
        })

        logger.info(`📬 Welcome notification created for user ${user.id}`)
      } catch (error) {
        logger.error('Failed to create welcome notification', { error })
      }
    }

    this.registerHandler('user.created', handler)
  }

  /**
   * Listener: organizationinvitation.created → Notification d'invitation
   */
  private registerOrganizationInvitationCreatedListener(): void {
    const handler: EventHandler<OrganizationInvitationCreatedEvent> = async (data) => {
      try {
        const { record: invitation } = data

        if (!invitation || !invitation.id) {
          logger.warn('organizationinvitation.created event received with incomplete data')
          return
        }

        // Charger les relations si nécessaire
        if (!invitation.organization) {
          await invitation.load('organization')
        }
        if (!invitation.inviter) {
          await invitation.load('inviter')
        }

        // Trouver l'utilisateur invité par email
        const userRepository = getService<UserRepository>(TYPES.UserRepository)
        const inviteeUser = await userRepository.findByEmail(invitation.inviteeEmail)

        if (!inviteeUser) {
          logger.info(
            `No user found with email ${invitation.inviteeEmail} - notification will be sent via email only`
          )
          return
        }

        const organizationName = invitation.organization?.name || 'une organisation'
        const inviterName = invitation.inviter?.fullName || invitation.inviter?.email || 'Un membre'

        await this.notificationService.createNotification({
          userId: inviteeUser.id,
          organizationId: invitation.organizationId,
          type: 'org.invitation',
          titleI18n: {
            fr: '📨 Nouvelle invitation',
            en: '📨 New invitation',
          },
          messageI18n: {
            fr: `${inviterName} vous invite à rejoindre ${organizationName}`,
            en: `${inviterName} invited you to join ${organizationName}`,
          },
          data: {
            invitationId: invitation.id,
            inviterId: invitation.inviterId,
            organizationId: invitation.organizationId,
            organizationName,
          },
        })

        logger.info(`📬 Invitation notification created for user ${inviteeUser.id}`)
      } catch (error) {
        logger.error('Failed to create invitation notification', { error })
      }
    }

    this.registerHandler('organizationinvitation.created', handler)
  }

  /**
   * Listener: subscription.created → Notification d'abonnement
   */
  private registerSubscriptionCreatedListener(): void {
    const handler: EventHandler<SubscriptionCreatedEvent> = async (data) => {
      try {
        const { record: subscription } = data

        if (!subscription || !subscription.id) {
          logger.warn('subscription.created event received with incomplete data')
          return
        }

        // Charger le plan si nécessaire
        if (!subscription.plan) {
          await subscription.load('plan')
        }

        const planName =
          subscription.plan?.nameI18n?.fr || subscription.plan?.nameI18n?.en || 'un plan'

        await this.notificationService.createNotification({
          userId: subscription.userId,
          organizationId: subscription.organizationId,
          type: 'system.announcement',
          titleI18n: {
            fr: '🎉 Abonnement activé',
            en: '🎉 Subscription activated',
          },
          messageI18n: {
            fr: `Votre abonnement ${planName} est maintenant actif !`,
            en: `Your ${planName} subscription is now active!`,
          },
          data: {
            subscriptionId: subscription.id,
            planId: subscription.planId,
            status: subscription.status,
          },
        })

        logger.info(`📬 Subscription notification created for user ${subscription.userId}`)
      } catch (error) {
        logger.error('Failed to create subscription notification', { error })
      }
    }

    this.registerHandler('subscription.created', handler)
  }
}
