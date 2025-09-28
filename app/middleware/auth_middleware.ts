import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const userId = ctx.session.get('user_id')
    if (!userId) {
      return ctx.response.status(401).json({ success: false, error: 'Non authentifié' })
    }
    return next()
  }
}
