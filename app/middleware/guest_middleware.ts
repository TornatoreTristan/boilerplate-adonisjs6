import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Guest middleware is used to deny access to routes that should
 * be accessed by unauthenticated users.
 *
 * For example, the login page should not be accessible if the user
 * is already logged-in
 */
export default class GuestMiddleware {
  /**
   * The URL to redirect to when user is logged-in
   */
  redirectTo = '/'

  async handle(ctx: HttpContext, next: NextFn) {
    const userId = ctx.session.get('user_id')

    // Si l'utilisateur est déjà connecté, le rediriger vers la page d'accueil
    if (userId) {
      return ctx.response.redirect(this.redirectTo)
    }

    return next()
  }
}
