/**
 * Types partagés pour Inertia.js
 * Ces types sont automatiquement disponibles dans usePage().props
 */

export interface SharedUser {
  id: string
  fullName: string | null
  email: string
  avatarUrl: string | null
  isEmailVerified: boolean
}

/**
 * Extension des types Inertia pour les props partagées
 */
declare module '@adonisjs/inertia/types' {
  export interface SharedProps {
    auth: {
      user: SharedUser | null
    }
  }
}
