import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import AuthorizationService from '#roles/services/authorization_service'
import { E } from '#shared/exceptions/index'

export default class RoleMiddleware {
  constructor(
    protected roles: string[],
    protected requireAll: boolean = false
  ) {}

  async handle(ctx: HttpContext, next: NextFn) {
    const userId = ctx.session.get('user_id')
    const organizationId = ctx.request.input('organization_id') || ctx.params.organizationId

    if (!userId) {
      E.unauthorized('Non authentifié')
    }

    if (!organizationId) {
      E.badRequest('Organization ID requis')
    }

    const authService = getService<AuthorizationService>(TYPES.AuthorizationService)

    const hasAccess = this.requireAll
      ? await authService.hasAllRoles(userId, organizationId, this.roles)
      : await authService.hasAnyRole(userId, organizationId, this.roles)

    if (!hasAccess) {
      E.forbidden(`Rôle requis: ${this.roles.join(this.requireAll ? ' et ' : ' ou ')}`)
    }

    return next()
  }
}
