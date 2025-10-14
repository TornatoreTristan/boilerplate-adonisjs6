import { injectable, inject } from 'inversify'
import { EventEmitter } from 'events'
import { TYPES } from '#shared/container/types'
import type InngestService from './inngest_service.js'

export interface EventData {
  [key: string]: any
}

export interface EventOptions {
  async?: boolean // Si true, utilise Inngest (reliable, retryable, observable)
}

export type EventHandler<T = EventData> = (data: T) => Promise<void> | void

/**
 * EventBusService - Système hybride d'événements
 *
 * - **Sync** : EventEmitter (immediate, in-process) pour hooks et validations
 * - **Async** : Inngest (reliable, retryable, observable) pour workflows
 *
 * @example
 * ```typescript
 * // Événement synchrone (immédiat)
 * eventBus.emit('user.validating', { data })
 *
 * // Événement asynchrone (via Inngest)
 * eventBus.emit('user/created', { record: user }, { async: true })
 * ```
 */
@injectable()
export default class EventBusService extends EventEmitter {
  constructor(@inject(TYPES.InngestService) private inngestService: InngestService) {
    super()
    this.setMaxListeners(100) // Augmenter la limite pour éviter les warnings
  }

  /**
   * Émettre un événement
   * - Sync (default) : EventEmitter natif (immediate, in-process)
   * - Async : Inngest (reliable, retryable, observable)
   */
  async emit(eventName: string, data: EventData = {}, options: EventOptions = {}): Promise<boolean> {
    const { async = false } = options

    if (async) {
      // Événements async → Inngest
      // Conversion du format "model.event" → "model/event" pour Inngest
      const inngestEventName = eventName.replace('.', '/') as any

      await this.inngestService.send({
        name: inngestEventName,
        data,
      })

      return true
    } else {
      // Événements sync → EventEmitter
      return super.emit(eventName, data)
    }
  }

  /**
   * Enregistrer un listener synchrone
   */
  on(eventName: string, handler: EventHandler): this {
    return super.on(eventName, handler)
  }

  /**
   * Enregistrer un listener synchrone (une seule fois)
   */
  once(eventName: string, handler: EventHandler): this {
    return super.once(eventName, handler)
  }

  /**
   * Supprimer un listener
   */
  off(eventName: string, handler: EventHandler): this {
    return super.off(eventName, handler)
  }

  /**
   * Supprimer tous les listeners d'un événement
   */
  removeAllListeners(eventName?: string): this {
    return super.removeAllListeners(eventName)
  }

  /**
   * Obtenir la liste des événements avec leurs listeners
   */
  getEventListeners(): Record<string, { sync: number }> {
    const result: Record<string, { sync: number }> = {}

    // Listeners synchrones
    for (const eventName of this.eventNames()) {
      const syncCount = this.listenerCount(eventName as string)
      result[eventName as string] = {
        sync: syncCount,
      }
    }

    return result
  }

  /**
   * Helper : Vérifier si Inngest est configuré
   */
  isInngestConfigured(): boolean {
    return this.inngestService.isConfigured()
  }
}
