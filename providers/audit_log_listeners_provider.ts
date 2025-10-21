import type { ApplicationService } from '@adonisjs/core/types'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type AuditLogListeners from '#audit/listeners/audit_log_listeners'

/**
 * AuditLogListenersProvider
 *
 * Initializes audit log listeners at application startup to automatically
 * log important system events for compliance and security tracking
 */
export default class AuditLogListenersProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Boot audit log listeners
   */
  async boot() {
    try {
      // Retrieve the listener from container (this will initialize it and register all events)
      getService<AuditLogListeners>(TYPES.AuditLogListeners)
    } catch (err) {
      console.error('Failed to boot audit log listeners provider:', err)
      // Don't throw to avoid blocking application startup
    }
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown() {
    // Nothing to clean up
  }
}
