import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type SessionService from '#sessions/services/session_service'

export default class UpdateSessionActivityMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { session } = ctx

    // Continuer avec la requête
    await next()

    // Après la requête, mettre à jour l'activité si une session existe
    const sessionId = session.get('session_id')

    if (sessionId) {
      const sessionService = getService<SessionService>(TYPES.SessionService)
      await sessionService.updateActivity(sessionId)
    }
  }
}
