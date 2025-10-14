import { Inngest } from 'inngest'
import { injectable } from 'inversify'
import logger from '@adonisjs/core/services/logger'

/**
 * Service Inngest pour gérer les événements et workflows
 *
 * @example
 * ```typescript
 * // Envoyer un événement
 * await inngestService.send({
 *   name: 'user/registered',
 *   data: { userId: user.id, email: user.email }
 * })
 *
 * // Envoyer plusieurs événements (batch)
 * await inngestService.sendBatch([
 *   { name: 'user/created', data: { record: user } },
 *   { name: 'email/send-welcome', data: { userId: user.id } }
 * ])
 * ```
 */
@injectable()
export default class InngestService {
  private client: Inngest

  constructor() {
    const eventKey = process.env.INNGEST_EVENT_KEY
    const signingKey = process.env.INNGEST_SIGNING_KEY
    const baseUrl = process.env.INNGEST_BASE_URL

    // Validation des clés en production
    if (!eventKey || !signingKey) {
      logger.warn('Inngest keys not configured. Events will not be sent.')
    }

    this.client = new Inngest({
      id: 'boilerplate-adonisjs6',
      eventKey,
      ...(baseUrl && { baseUrl }), // Pour self-hosted
    })

    logger.info('Inngest service initialized', {
      configured: !!eventKey && !!signingKey,
      selfHosted: !!baseUrl,
    })
  }

  /**
   * Envoyer un événement unique
   */
  async send(event: {
    name: string
    data: any
    user?: { email?: string; external_id?: string }
    ts?: number
  }): Promise<void> {
    try {
      await this.client.send(event as any)

      logger.debug('Inngest event sent', {
        event: event.name,
        data: event.data,
      })
    } catch (error) {
      logger.error('Failed to send Inngest event', {
        event: event.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      // Ne pas throw pour ne pas bloquer le flow applicatif
      // Les événements Inngest sont considérés comme "best effort"
    }
  }

  /**
   * Envoyer plusieurs événements en batch (plus performant)
   */
  async sendBatch(
    events: Array<{
      name: string
      data: any
      user?: { email?: string; external_id?: string }
      ts?: number
    }>
  ): Promise<void> {
    try {
      await this.client.send(events as any)

      logger.debug('Inngest batch events sent', {
        count: events.length,
        events: events.map((e) => e.name),
      })
    } catch (error) {
      logger.error('Failed to send Inngest batch events', {
        count: events.length,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Récupérer le client Inngest (pour créer des functions)
   */
  getClient(): Inngest {
    return this.client
  }

  /**
   * Vérifier si Inngest est correctement configuré
   */
  isConfigured(): boolean {
    return !!(process.env.INNGEST_EVENT_KEY && process.env.INNGEST_SIGNING_KEY)
  }
}
