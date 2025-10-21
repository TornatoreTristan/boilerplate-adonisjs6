import type { HttpContext } from '@adonisjs/core/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import NotificationService from '#notifications/services/notification_service'
import type { NotificationType } from '#notifications/types/notification'

export default class NotificationsController {
  async index({ request, user, inertia }: HttpContext) {
    if (!user) {
      return inertia.location('/login')
    }

    const notificationService = getService<NotificationService>(TYPES.NotificationService)

    const unreadOnly = request.input('unread') === 'true'
    const type = request.input('type') as NotificationType | undefined

    const notifications = await notificationService.getUserNotifications(user.id, {
      unreadOnly,
      type,
    })

    const unreadCount = await notificationService.getUnreadCount(user.id)

    // Trier les notifications : non lues en premier, puis par date décroissante
    const sortedNotifications = notifications.sort((a, b) => {
      // Si une est lue et l'autre non, la non lue vient en premier
      if (!a.readAt && b.readAt) return -1
      if (a.readAt && !b.readAt) return 1
      // Sinon, trier par date de création (plus récente en premier)
      return b.createdAt.toMillis() - a.createdAt.toMillis()
    })

    // Convertir manuellement les notifications pour Inertia
    const serializedNotifications = sortedNotifications.map((n) => ({
      id: n.id,
      type: n.type,
      titleI18n: n.titleI18n,
      messageI18n: n.messageI18n,
      data: n.data,
      readAt: n.readAt ? n.readAt.toISO() : null,
      createdAt: n.createdAt.toISO(),
    }))

    return inertia.render('notifications', {
      notifications: serializedNotifications,
      unreadCount,
    })
  }

  async unreadCount({ response, session }: HttpContext) {
    const userId = session.get('user_id')

    if (!userId) {
      return response.status(401).json({ error: 'Non authentifié' })
    }

    const notificationService = getService<NotificationService>(TYPES.NotificationService)
    const count = await notificationService.getUnreadCount(userId)

    return response.json({ count })
  }

  async markAsRead({ params, response, session }: HttpContext) {
    const userId = session.get('user_id')
    const notificationId = params.id

    if (!userId) {
      return response.status(401).json({ error: 'Non authentifié' })
    }

    const notificationService = getService<NotificationService>(TYPES.NotificationService)

    const notifications = await notificationService.getUserNotifications(userId)
    const notification = notifications.find((n) => n.id === notificationId)

    if (!notification) {
      return response.status(403).json({ error: 'Non autorisé' })
    }

    await notificationService.markAsRead(notificationId)

    return response.status(303).redirect().back()
  }

  async markAllAsRead({ response, session }: HttpContext) {
    const userId = session.get('user_id')

    if (!userId) {
      return response.status(401).json({ error: 'Non authentifié' })
    }

    const notificationService = getService<NotificationService>(TYPES.NotificationService)
    await notificationService.markAllAsReadForUser(userId)

    return response.status(303).redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const userId = session.get('user_id')
    const notificationId = params.id

    if (!userId) {
      return response.status(401).json({ error: 'Non authentifié' })
    }

    const notificationService = getService<NotificationService>(TYPES.NotificationService)

    const notifications = await notificationService.getUserNotifications(userId)
    const notification = notifications.find((n) => n.id === notificationId)

    if (!notification) {
      return response.status(403).json({ error: 'Non autorisé' })
    }

    await notificationService.deleteNotification(notificationId)

    return response.status(303).redirect().back()
  }
}
