import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import NotificationService from '#notifications/services/notification_service'
import UserRepository from '#users/repositories/user_repository'

export default class TestNotification extends BaseCommand {
  static commandName = 'test:notification'
  static description = 'Create a test notification to verify real-time Transmit functionality'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('🧪 Testing real-time notification system...')

    try {
      // 1. Trouver un utilisateur de test
      const userRepo = getService<UserRepository>(TYPES.UserRepository)
      const users = await userRepo.findAll()

      if (users.length === 0) {
        this.logger.error('❌ No users found in database. Please create a user first.')
        return
      }

      const testUser = users[0]
      this.logger.info(`✅ Found test user: ${testUser.email} (ID: ${testUser.id})`)

      // 2. Créer une notification de test
      const notificationService = getService<NotificationService>(TYPES.NotificationService)

      const notification = await notificationService.createNotification({
        userId: testUser.id,
        type: 'system.announcement',
        title: '🧪 Test Notification from CLI',
        message: `This is a test notification sent at ${new Date().toLocaleTimeString()}. If you see this in real-time in the browser, Transmit is working! 🎉`,
        data: {
          testId: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          source: 'ace-command',
        },
      })

      this.logger.success('✅ Test notification created!')
      this.logger.info(`📬 Notification ID: ${notification.id}`)
      this.logger.info(`📡 Broadcasted to channel: user/${testUser.id}/notifications`)
      this.logger.info('')
      this.logger.info('👀 Check your browser to see if the notification appears in real-time!')
      this.logger.info(`   - Badge should update with unread count`)
      this.logger.info(`   - Toast notification should appear`)
      this.logger.info(`   - Console should log: "📨 Received notification event"`)
    } catch (error) {
      this.logger.error('❌ Failed to create test notification')
      this.logger.error(error.message)
    }
  }
}
