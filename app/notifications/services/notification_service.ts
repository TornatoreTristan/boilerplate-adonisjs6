import { injectable, inject } from 'inversify'
import NotificationRepository from '#notifications/repositories/notification_repository'
import Notification from '#notifications/models/notification'
import type { CreateNotificationData, NotificationType } from '#notifications/types/notification'
import { TYPES } from '#shared/container/types'
import transmit from '@adonisjs/transmit/services/main'
import logger from '@adonisjs/core/services/logger'

export interface GetNotificationsOptions {
  unreadOnly?: boolean
  type?: NotificationType
  organizationId?: string
}

@injectable()
export default class NotificationService {
  constructor(
    @inject(TYPES.NotificationRepository) private notificationRepo: NotificationRepository
  ) {}

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    // 1. Créer la notification en base de données
    const notification = await this.notificationRepo.create(
      {
        userId: data.userId,
        organizationId: data.organizationId || null,
        type: data.type,
        titleI18n: { fr: data.title, en: data.title },
        messageI18n: { fr: data.message, en: data.message },
        data: data.data || null,
      } as any,
      {
        cache: { tags: ['notifications', `user_${data.userId}_notifications`] },
      }
    )

    // 2. Broadcast en temps réel via Transmit (SSE)
    try {
      transmit.broadcast(`user/${data.userId}/notifications`, {
        type: 'notification:new',
        notification: {
          id: notification.id,
          type: notification.type,
          titleI18n: notification.titleI18n,
          messageI18n: notification.messageI18n,
          data: notification.data,
          readAt: notification.readAt,
          createdAt: notification.createdAt.toISO(),
        },
      })
    } catch (error) {
      // Ne pas fail si le broadcast échoue (notification en base reste créée)
      logger.error({ err: error }, 'Failed to broadcast notification via Transmit')
    }

    return notification
  }

  async markAsRead(notificationId: string): Promise<void> {
    // Récupérer la notification pour avoir le userId
    const notification = await this.notificationRepo.findById(notificationId)
    if (!notification) return

    await this.notificationRepo.markAsRead(notificationId)

    // Broadcast l'événement de lecture
    try {
      transmit.broadcast(`user/${notification.userId}/notifications`, {
        type: 'notification:read',
        notificationId,
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to broadcast notification:read event')
    }
  }

  async markAsReadBulk(notificationIds: string[]): Promise<number> {
    return this.notificationRepo.markAsReadBulk(notificationIds)
  }

  async markAllAsReadForUser(userId: string): Promise<number> {
    const unreadNotifications = await this.notificationRepo.findUnreadByUserId(userId)
    const notificationIds = unreadNotifications.map((n) => n.id)

    if (notificationIds.length === 0) {
      return 0
    }

    return this.notificationRepo.markAsReadBulk(notificationIds)
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.countUnreadByUserId(userId)
  }

  async getUserNotifications(
    userId: string,
    options: GetNotificationsOptions = {}
  ): Promise<Notification[]> {
    if (options.unreadOnly) {
      return this.notificationRepo.findUnreadByUserId(userId)
    }

    if (options.type) {
      const allNotifications = await this.notificationRepo.findByUserId(userId)
      return allNotifications.filter((n) => n.type === options.type)
    }

    return this.notificationRepo.findByUserId(userId)
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationRepo.delete(notificationId, { soft: true })
  }
}
