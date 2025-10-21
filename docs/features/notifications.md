# 🔔 Système de Notifications

Système de notifications complet avec API REST, cache Redis, soft deletes et support multi-tenant.

## 🎯 Fonctionnalités

- ✅ CRUD complet via API REST
- ✅ Notifications unread/read
- ✅ Compteur de notifications non lues (cached)
- ✅ Filtrage par type et organisation
- ✅ Soft deletes et restore
- ✅ Cache Redis avec invalidation par tags
- ✅ Support multi-tenant (par organisation)
- ✅ Architecture Repository Pattern + IoC
- ✅ Tests complets (30 tests TDD)

## 📦 Architecture

### Structure

```
app/notifications/
├── models/notification.ts              # Modèle Lucid
├── repositories/notification_repository.ts  # Data access layer
├── services/notification_service.ts    # Business logic
├── controllers/notifications_controller.ts  # HTTP handlers
└── types/notification.ts               # TypeScript types
```

### Types de Notifications

```typescript
type NotificationType =
  | 'user.mentioned'           // Utilisateur mentionné
  | 'org.invitation'           // Invitation à une organisation
  | 'org.member_joined'        // Nouveau membre dans l'org
  | 'org.member_left'          // Membre a quitté l'org
  | 'system.announcement'      // Annonce système
  | 'system.maintenance'       // Maintenance programmée
```

## 🚀 Utilisation

### Créer une notification

```typescript
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import NotificationService from '#notifications/services/notification_service'

const notificationService = getService<NotificationService>(TYPES.NotificationService)

const notification = await notificationService.createNotification({
  userId: user.id,
  organizationId: organization.id, // Optionnel
  type: 'user.mentioned',
  title: 'Vous avez été mentionné',
  message: 'John Doe vous a mentionné dans un commentaire',
  data: {
    commentId: '123',
    postId: '456',
  },
})
```

### Récupérer les notifications d'un utilisateur

```typescript
// Toutes les notifications
const allNotifications = await notificationService.getUserNotifications(userId)

// Uniquement les non lues
const unreadNotifications = await notificationService.getUserNotifications(userId, {
  unreadOnly: true,
})

// Filtrer par type
const mentions = await notificationService.getUserNotifications(userId, {
  type: 'user.mentioned',
})
```

### Compter les notifications non lues

```typescript
const unreadCount = await notificationService.getUnreadCount(userId)
// Résultat cached dans Redis avec tag `user_{userId}_notifications`
```

### Marquer comme lue

```typescript
// Une seule notification
await notificationService.markAsRead(notificationId)

// Plusieurs notifications
await notificationService.markAsReadBulk([id1, id2, id3])

// Toutes les notifications de l'utilisateur
const count = await notificationService.markAllAsReadForUser(userId)
```

### Supprimer une notification

```typescript
// Soft delete par défaut
await notificationService.deleteNotification(notificationId)
```

## 📡 API REST

Toutes les routes nécessitent l'authentification (`auth` middleware).

### GET /api/notifications

Liste les notifications de l'utilisateur connecté.

**Query Parameters:**
- `unread=true` - Uniquement les non lues
- `type=user.mentioned` - Filtrer par type

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "organizationId": "uuid",
      "type": "user.mentioned",
      "title": "Vous avez été mentionné",
      "message": "John Doe vous a mentionné",
      "data": { "commentId": "123" },
      "readAt": null,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET /api/notifications/unread-count

Récupère le nombre de notifications non lues.

**Response:**
```json
{
  "count": 5
}
```

### PATCH /api/notifications/:id/read

Marque une notification comme lue.

**Response:**
```json
{
  "success": true
}
```

### PATCH /api/notifications/mark-all-read

Marque toutes les notifications de l'utilisateur comme lues.

**Response:**
```json
{
  "success": true,
  "count": 12
}
```

### DELETE /api/notifications/:id

Supprime une notification (soft delete).

**Response:**
```json
{
  "success": true
}
```

## 🗄️ Base de Données

### Migration

```typescript
table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
table.uuid('user_id').references('users.id').onDelete('CASCADE').notNullable()
table.uuid('organization_id').references('organizations.id').onDelete('CASCADE').nullable()

table.string('type').notNullable()
table.string('title').notNullable()
table.text('message').notNullable()
table.jsonb('data').nullable()

table.timestamp('read_at').nullable()
table.timestamp('created_at').notNullable()
table.timestamp('updated_at').nullable()
table.timestamp('deleted_at').nullable()

// Index pour performances
table.index(['user_id', 'read_at'])
table.index(['organization_id'])
table.index(['type'])
table.index(['deleted_at'])
```

### Modèle Notification

```typescript
export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare organizationId: string | null

  @column()
  declare type: NotificationType

  @column()
  declare title: string

  @column()
  declare message: string

  @column({
    prepare: (value) => JSON.stringify(value),
    consume: (value) => JSON.parse(value),
  })
  declare data: Record<string, any> | null

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime()
  declare deleted_at: DateTime | null

  // Getters
  get isRead(): boolean {
    return this.readAt !== null
  }

  get isUnread(): boolean {
    return this.readAt === null
  }
}
```

## ⚡ Cache & Performance

### Stratégie de Cache

```typescript
// Lors de la création
await notificationRepo.create(data, {
  cache: { tags: ['notifications', `user_${userId}_notifications`] }
})
```

### Invalidation automatique

- Création → Invalide `user_{userId}_notifications`
- Marquer comme lu → Invalide cache de la notification
- Suppression → Invalide cache de la notification

### Count unread cached

Le nombre de notifications non lues est automatiquement caché via `BaseRepository`.

## 🎨 Exemples d'Usage

### Notification de mention

```typescript
// Quand un utilisateur mentionne un autre dans un commentaire
await notificationService.createNotification({
  userId: mentionedUser.id,
  organizationId: comment.organizationId,
  type: 'user.mentioned',
  title: 'Nouvelle mention',
  message: `${author.fullName} vous a mentionné dans un commentaire`,
  data: {
    commentId: comment.id,
    postId: comment.postId,
    authorId: author.id,
  },
})
```

### Invitation à une organisation

```typescript
await notificationService.createNotification({
  userId: invitedUser.id,
  organizationId: organization.id,
  type: 'org.invitation',
  title: 'Invitation à rejoindre une organisation',
  message: `Vous avez été invité à rejoindre ${organization.name}`,
  data: {
    invitationId: invitation.id,
    invitedBy: inviter.id,
  },
})
```

### Annonce système

```typescript
// Notifier tous les utilisateurs
const users = await userRepository.findAll()

for (const user of users) {
  await notificationService.createNotification({
    userId: user.id,
    type: 'system.announcement',
    title: 'Nouvelle fonctionnalité disponible',
    message: 'Découvrez notre nouveau système de notifications !',
    data: {
      featureUrl: '/features/notifications',
    },
  })
}
```

## 🔒 Sécurité

### Autorisation

Le controller vérifie automatiquement que :
- L'utilisateur est authentifié
- La notification appartient à l'utilisateur connecté

```typescript
// Exemple de vérification dans le controller
const notifications = await notificationService.getUserNotifications(userId)
const notification = notifications.find((n) => n.id === notificationId)

if (!notification) {
  return response.status(403).json({ error: 'Non autorisé' })
}
```

### Protection CSRF

Routes protégées par le middleware `auth` qui inclut la protection CSRF.

## 🧪 Tests

### Coverage Complet

- **12 tests** NotificationRepository (unit)
- **10 tests** NotificationService (unit)
- **8 tests** NotificationsController (functional)

**Total: 30 tests** couvrant tous les cas d'usage

### Lancer les tests

```bash
# Tests du repository
npm run test -- --files="notification_repository.spec.ts"

# Tests du service
npm run test -- --files="notification_service.spec.ts"

# Tests du controller
npm run test -- --files="notifications_controller.spec.ts"

# Tous les tests
npm run test
```

## 🔴 Real-time avec Transmit (SSE)

Le système de notifications utilise **AdonisJS Transmit** pour les mises à jour en temps réel via Server-Sent Events.

### Backend - Broadcast des notifications

```typescript
// app/notifications/services/notification_service.ts
import transmit from '@adonisjs/transmit/services/main'

async createNotification(data: CreateNotificationData): Promise<Notification> {
  const notification = await this.notificationRepo.create(data, {
    cache: { tags: ['notifications', `user_${data.userId}_notifications`] }
  })

  // Broadcast en temps réel via Transmit
  transmit.broadcast(`user/${data.userId}/notifications`, {
    type: 'notification:new',
    notification: {
      id: notification.id,
      type: notification.type,
      titleI18n: notification.titleI18n,
      messageI18n: notification.messageI18n,
      data: notification.data,
      readAt: notification.readAt ? notification.readAt.toISO() : null,
      createdAt: notification.createdAt.toISO(),
    },
  })

  return notification
}
```

### Frontend - Hook React avec Transmit

**⚠️ IMPORTANT: Singleton Pattern Obligatoire**

Transmit doit être instancié **UNE SEULE FOIS** pour toute l'application. Créer plusieurs instances cause une accumulation de connexions SSE qui finit par bloquer l'application (limite HTTP/2 de 6 connexions par domaine).

#### Singleton Transmit Client

```typescript
// inertia/lib/transmit.ts
import { Transmit } from '@adonisjs/transmit-client'

let transmitInstance: Transmit | null = null

export function getTransmitInstance(): Transmit {
  if (!transmitInstance) {
    transmitInstance = new Transmit({
      baseUrl: window.location.origin,
    })
  }
  return transmitInstance
}
```

#### Hook useNotifications

```typescript
// inertia/hooks/use-notifications.ts
import { useEffect, useState, useRef } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { getTransmitInstance } from '@/lib/transmit'

export function useNotifications() {
  const { auth, i18n } = usePage<{
    auth: { user: { id: string } | null }
    i18n: { locale: string }
  }>().props
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const localeRef = useRef(i18n.locale)

  // Sync locale ref
  useEffect(() => {
    localeRef.current = i18n.locale
  }, [i18n.locale])

  useEffect(() => {
    if (!auth.user) return

    // UTILISER LE SINGLETON - JAMAIS new Transmit() ici !
    const transmit = getTransmitInstance()
    const channelName = `user/${auth.user.id}/notifications`
    const subscription = transmit.subscription(channelName)

    const stopListening = subscription.onMessage((payload) => {
      if (payload.type === 'notification:new' && payload.notification) {
        const newNotification = payload.notification
        setNotifications((prev) => [newNotification, ...prev])

        if (!newNotification.readAt) {
          setUnreadCount((prev) => prev + 1)
        }

        // Toast notification
        const currentLocale = (localeRef.current || 'fr') as 'fr' | 'en'
        const title = newNotification.titleI18n[currentLocale] ||
                     newNotification.titleI18n.fr
        const message = newNotification.messageI18n[currentLocale] ||
                       newNotification.messageI18n.fr

        toast.info(title, {
          description: message,
          duration: 5000,
        })
      }

      if (payload.type === 'notification:read' && payload.notificationId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === payload.notificationId
              ? { ...n, readAt: new Date().toISOString() }
              : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    })

    subscription.create().then(() => {
      setIsConnected(true)
    }).catch((error) => {
      console.error('Failed to connect to notifications stream:', error)
      setIsConnected(false)
    })

    return () => {
      stopListening()
      subscription.delete().catch(() => {})
      setIsConnected(false)
    }
  }, [auth.user]) // ⚠️ UNIQUEMENT auth.user - PAS de locale ou autres deps

  return { notifications, unreadCount, isConnected }
}
```

### Problème Résolu: Freeze après suppressions multiples

**Symptôme**: Après exactement 5 suppressions de notifications, l'application se figeait avec un chargement infini.

**Cause**:
- Chaque suppression déclenchait un reload Inertia de la page
- Le composant React se démontait et remontait
- Sans singleton, `new Transmit()` créait une nouvelle instance à chaque fois
- Les anciennes subscriptions SSE restaient actives (pending)
- Après 5 reloads = 5 connexions SSE + 1 nouvelle = **6 connexions**
- Limite HTTP/2 atteinte (6 connexions max par domaine)
- La 6e requête `subscribe` restait bloquée en pending → freeze

**Solution**: Utiliser un **singleton Transmit** partagé par toute l'application via `getTransmitInstance()`. La même instance est réutilisée même après les reloads Inertia.

### Best Practices Transmit

1. ✅ **UNE seule instance Transmit** par application (singleton)
2. ✅ **Stocker `stopListening()`** retourné par `onMessage()`
3. ✅ **Cleanup complet** dans le `return` du `useEffect`:
   - Appeler `stopListening()` pour arrêter le handler
   - Appeler `subscription.delete()` pour unsubscribe
4. ✅ **Dependencies minimales** dans `useEffect` (`[auth.user]` uniquement)
5. ✅ **Utiliser refs** pour les valeurs qui changent sans re-render (locale)
6. ❌ **JAMAIS** `new Transmit()` dans un composant React
7. ❌ **JAMAIS** oublier le cleanup dans le return du `useEffect`

### Email Digest

Job quotidien qui envoie un résumé des notifications non lues :

```typescript
// app/notifications/jobs/send_notification_digest_job.ts
export default class SendNotificationDigestJob {
  async handle() {
    const users = await userRepository.findAll()

    for (const user of users) {
      const unread = await notificationService.getUserNotifications(user.id, {
        unreadOnly: true,
      })

      if (unread.length > 0) {
        await emailService.sendNotificationDigest(user.email, {
          userName: user.fullName,
          notifications: unread,
        })
      }
    }
  }
}
```

## 📊 Métriques & Monitoring

### Queries optimisées

Grâce aux index sur `user_id`, `read_at`, `type` et `deleted_at` :
- Récupération des notifications d'un user : `O(log n)`
- Count unread : `O(log n)` via index composite
- Filtrage par type : `O(log n)`

### Cache Hit Rate

Le cache Redis permet de :
- Éviter les queries répétées pour `unread count`
- Accélérer l'accès aux notifications récentes
- Réduire la charge DB jusqu'à 80% sur les endpoints read-heavy

## 🎯 Best Practices

1. **Toujours utiliser le NotificationService** - Jamais de Lucid direct
2. **Typer les notifications** - Utiliser les types prédéfinis
3. **Données structurées** - Le champ `data` doit être un objet typé
4. **Purge régulière** - Soft delete les notifications anciennes (>90 jours)
5. **Limite par user** - Max 1000 notifications par utilisateur

## 📝 Logs & Debugging

```typescript
// Les événements sont automatiquement loggés via EventBus
eventBus.on('notification.created', ({ record }) => {
  logger.info(`Notification created for user ${record.userId}`)
})

eventBus.on('notification.deleted', ({ record }) => {
  logger.info(`Notification ${record.id} deleted`)
})
```

---

**Développé avec TDD strict et suivant les guidelines du boilerplate AdonisJS 6**
