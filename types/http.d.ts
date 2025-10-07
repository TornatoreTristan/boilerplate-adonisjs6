/**
 * Extension des types HttpContext pour ajouter la propriété user
 */

import User from '#users/models/user'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    user?: User
  }
}
