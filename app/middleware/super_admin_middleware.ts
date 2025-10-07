import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { E } from '#shared/exceptions/index'

export default class SuperAdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // L'utilisateur a déjà été chargé par le middleware auth()
    // qui doit être appelé AVANT ce middleware
    if (!ctx.user) {
      E.unauthorized('Authentification requise')
    }

    const isSuperAdmin = await ctx.user.isSuperAdmin()

    if (!isSuperAdmin) {
      E.forbidden('Accès réservé aux super-administrateurs')
    }

    return next()
  }
}
