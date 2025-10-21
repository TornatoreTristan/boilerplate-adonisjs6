import { injectable, inject } from 'inversify'
import UserNotificationPreferenceRepository from '#notifications/repositories/user_notification_preference_repository'
import { TYPES } from '#shared/container/types'
import type { NotificationType } from '#notifications/types/notification'
import type { NotificationChannel } from '#notifications/models/user_notification_preference'

@injectable()
export default class UserNotificationPreferenceService {
  constructor(
    @inject(TYPES.UserNotificationPreferenceRepository)
    private preferenceRepo: UserNotificationPreferenceRepository
  ) {}

  async getUserPreferences(userId: string) {
    return this.preferenceRepo.findByUserId(userId)
  }

  async isNotificationEnabled(
    userId: string,
    notificationType: NotificationType,
    channel: NotificationChannel = 'in_app'
  ): Promise<boolean> {
    return this.preferenceRepo.isEnabled(userId, notificationType, channel)
  }

  async setPreference(
    userId: string,
    notificationType: NotificationType,
    channel: NotificationChannel,
    enabled: boolean
  ) {
    return this.preferenceRepo.setPreference(userId, notificationType, channel, enabled)
  }

  async initializeDefaultPreferences(userId: string) {
    await this.preferenceRepo.initializeDefaultPreferences(userId)
  }

  async updateBulkPreferences(
    userId: string,
    preferences: Array<{
      notificationType: NotificationType
      channel: NotificationChannel
      enabled: boolean
    }>
  ) {
    const results = []
    for (const pref of preferences) {
      const result = await this.setPreference(
        userId,
        pref.notificationType,
        pref.channel,
        pref.enabled
      )
      results.push(result)
    }
    return results
  }
}
