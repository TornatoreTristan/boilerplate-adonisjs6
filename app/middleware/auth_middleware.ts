import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#users/models/user'
import { E } from '#shared/exceptions/index'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const userId = ctx.session.get('user_id')

    // Si pas d'ID utilisateur en session
    if (!userId) {
      return this.handleUnauthenticated(ctx)
    }

    // Charger l'utilisateur depuis la base
    const user = await User.find(userId)

    // Si l'utilisateur n'existe plus
    if (!user) {
      // Nettoyer la session invalide
      ctx.session.forget('user_id')
      ctx.session.forget('session_id')
      return this.handleUnauthenticated(ctx)
    }

    // Stocker l'utilisateur dans le contexte
    ctx.user = user

    return next()
  }

  /**
   * Gère les requêtes non authentifiées
   * - Requêtes web/Inertia : redirection vers /login
   * - Requêtes API : exception 401
   */
  private handleUnauthenticated(ctx: HttpContext) {
    // Détecter si c'est une requête API (attend du JSON)
    const isApiRequest =
      ctx.request.header('accept')?.includes('application/json') ||
      ctx.request.url().startsWith('/api/') ||
      ctx.request.url().startsWith('/auth/') ||
      ctx.request.url().startsWith('/admin/') ||
      ctx.request.url() === '/admin' ||
      ctx.request.url().startsWith('/debug/')

    if (isApiRequest) {
      // Pour les requêtes API, lever une exception
      E.unauthorized('Authentification requise')
    }

    // Pour toutes les autres requêtes (web/Inertia), rediriger vers login
    return ctx.response.redirect('/login')
  }
}
