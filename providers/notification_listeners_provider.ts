import type { ApplicationService } from '@adonisjs/core/types'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import NotificationListeners from '#notifications/listeners/notification_listeners'
import logger from '@adonisjs/core/services/logger'

/**
 * NotificationListenersProvider
 *
 * Enregistre automatiquement les listeners de notifications au démarrage de l'application
 */
export default class NotificationListenersProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Enregistrer les listeners au démarrage
   */
  async boot() {
    try {
      logger.info('Starting to boot notification listeners provider...')

      // Récupérer le listener depuis le container
      const listeners = getService<NotificationListeners>(TYPES.NotificationListeners)
      logger.info('NotificationListeners service retrieved from container')

      // Enregistrer tous les listeners
      listeners.register()

      logger.info('✅ Notification listeners provider booted successfully')
    } catch (error) {
      logger.error('Failed to boot notification listeners provider')
      console.error('Notification listeners provider error:', error)
      // Ne pas throw pour ne pas bloquer le démarrage
    }
  }

  /**
   * Nettoyer les listeners à l'arrêt
   */
  async shutdown() {
    try {
      const listeners = getService<NotificationListeners>(TYPES.NotificationListeners)
      listeners.unregisterAll()

      logger.info('🔕 Notification listeners provider shut down')
    } catch (error) {
      logger.error('Failed to shutdown notification listeners provider')
      console.error('Shutdown error:', error)
    }
  }
}
