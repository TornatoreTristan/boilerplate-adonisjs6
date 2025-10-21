import type { HttpContext } from '@adonisjs/core/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import NotificationService from '#notifications/services/notification_service'

/**
 * TestNotificationController
 *
 * Controller de test pour vérifier le fonctionnement du système de notifications temps réel
 */
export default class TestNotificationController {
  /**
   * Créer une notification de test pour l'utilisateur connecté
   */
  async create({ user, response }: HttpContext) {
    if (!user) {
      return response.unauthorized({ error: 'User not authenticated' })
    }

    const notificationService = getService<NotificationService>(TYPES.NotificationService)

    // Créer une notification de test
    const notification = await notificationService.createNotification({
      userId: user.id,
      type: 'system.announcement',
      title: '🧪 Test Notification',
      message: `This is a test notification sent at ${new Date().toLocaleTimeString()}. If you see this in real-time, Transmit is working! 🎉`,
      data: {
        testId: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
      },
    })

    return response.ok({
      success: true,
      message: 'Test notification created and broadcasted',
      notification: {
        id: notification.id,
        type: notification.type,
        titleI18n: notification.titleI18n,
        messageI18n: notification.messageI18n,
        createdAt: notification.createdAt,
      },
    })
  }
}
