import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const NotificationsController = () => import('#notifications/controllers/notifications_controller')
const TestNotificationController = () =>
  import('#notifications/controllers/test_notification_controller')

router
  .group(() => {
    router.get('/notifications', [NotificationsController, 'index'])
    router.get('/notifications/unread-count', [NotificationsController, 'unreadCount'])
    router.patch('/notifications/mark-all-read', [NotificationsController, 'markAllAsRead'])
    router.patch('/notifications/:id/read', [NotificationsController, 'markAsRead'])
    router.delete('/notifications/:id', [NotificationsController, 'destroy'])

    // Route de test pour vérifier Transmit
    router.post('/notifications/test', [TestNotificationController, 'create'])
  })
  .prefix('/api')
  .use([middleware.auth(), middleware.updateSessionActivity()])
