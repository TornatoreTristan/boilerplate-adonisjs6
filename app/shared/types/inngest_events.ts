/**
 * Event Schemas pour Inngest
 * Type-safe events avec validation automatique
 */

import type User from '#users/models/user'
import type Organization from '#organizations/models/organization'
import type Upload from '#uploads/models/upload'
import type Notification from '#notifications/models/notification'

/**
 * Interface centrale de tous les événements Inngest
 * Utiliser le format 'domain/action' pour les noms d'événements
 */
export interface InngestEvents {
  // ==========================================
  // REPOSITORY EVENTS (Auto-émis par BaseRepository)
  // ==========================================

  // User events
  'user/before-create': { data: { data: Partial<User> } }
  'user/created': { data: { record: User } }
  'user/before-update': { data: { id: string | number; data: Partial<User>; record: User } }
  'user/updated': { data: { record: User } }
  'user/before-delete': { data: { record: User } }
  'user/deleted': { data: { record: User } }

  // Organization events
  'organization/before-create': { data: { data: Partial<Organization> } }
  'organization/created': { data: { record: Organization } }
  'organization/before-update': { data: { id: string | number; data: Partial<Organization>; record: Organization } }
  'organization/updated': { data: { record: Organization } }
  'organization/before-delete': { data: { record: Organization } }
  'organization/deleted': { data: { record: Organization } }

  // Upload events
  'upload/before-create': { data: { data: Partial<Upload> } }
  'upload/created': { data: { record: Upload } }
  'upload/before-update': { data: { id: string | number; data: Partial<Upload>; record: Upload } }
  'upload/updated': { data: { record: Upload } }
  'upload/before-delete': { data: { record: Upload } }
  'upload/deleted': { data: { record: Upload } }

  // Notification events
  'notification/before-create': { data: { data: Partial<Notification> } }
  'notification/created': { data: { record: Notification } }
  'notification/before-update': { data: { id: string | number; data: Partial<Notification>; record: Notification } }
  'notification/updated': { data: { record: Notification } }
  'notification/before-delete': { data: { record: Notification } }
  'notification/deleted': { data: { record: Notification } }

  // ==========================================
  // BUSINESS EVENTS (Custom, émis manuellement)
  // ==========================================

  // Authentication & User Management
  'user/registered': {
    data: {
      userId: string
      email: string
      fullName?: string | null
    }
  }
  'user/email-verified': {
    data: {
      userId: string
      email: string
    }
  }
  'user/password-reset-requested': {
    data: {
      email: string
      token: string
    }
  }
  'user/password-reset-completed': {
    data: {
      userId: string
      email: string
    }
  }

  // Organization Management
  'organization/member-added': {
    data: {
      organizationId: string
      userId: string
      role: 'owner' | 'admin' | 'member'
      invitedBy?: string
    }
  }
  'organization/member-removed': {
    data: {
      organizationId: string
      userId: string
      removedBy: string
    }
  }
  'organization/role-changed': {
    data: {
      organizationId: string
      userId: string
      oldRole: string
      newRole: string
      changedBy: string
    }
  }

  // Session Management
  'session/created': {
    data: {
      sessionId: string
      userId: string
      ipAddress?: string
      userAgent?: string
    }
  }
  'session/ended': {
    data: {
      sessionId: string
      userId: string
      reason: 'logout' | 'timeout' | 'forced'
    }
  }

  // ==========================================
  // EMAIL EVENTS (Workflows asynchrones)
  // ==========================================

  'email/send-welcome': {
    data: {
      userId: string
    }
  }
  'email/send-verification': {
    data: {
      userId: string
      token: string
      email: string
    }
  }
  'email/send-password-reset': {
    data: {
      email: string
      token: string
    }
  }
  'email/send-organization-invitation': {
    data: {
      organizationId: string
      email: string
      invitedBy: string
      role: string
    }
  }
  'email/send-queued': {
    data: {
      emailData: any // QueueEmailData
      options?: {
        priority?: string
        delay?: number
      }
    }
  }

  // ==========================================
  // NOTIFICATION EVENTS (Push notifications)
  // ==========================================

  'notification/send': {
    data: {
      userId: string
      type: 'info' | 'success' | 'warning' | 'error'
      title: string
      message: string
      actionUrl?: string
      actionLabel?: string
    }
  }

  // ==========================================
  // ANALYTICS EVENTS (Tracking asynchrone)
  // ==========================================

  'analytics/track-event': {
    data: {
      userId?: string
      organizationId?: string
      eventName: string
      properties?: Record<string, any>
      timestamp?: string
    }
  }

  // ==========================================
  // CLEANUP EVENTS (Tâches de maintenance)
  // ==========================================

  'cleanup/expired-tokens': {
    data: {
      tokenType: 'password-reset' | 'email-verification'
      olderThan: string // ISO date
    }
  }
  'cleanup/old-sessions': {
    data: {
      olderThan: string // ISO date
    }
  }
}

/**
 * Type helper pour extraire le payload d'un événement
 */
export type InngestEventPayload<T extends keyof InngestEvents> = InngestEvents[T]['data']

/**
 * Type helper pour les noms d'événements
 */
export type InngestEventName = keyof InngestEvents
