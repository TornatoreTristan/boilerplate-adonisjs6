# ⚡ Inngest Event System

> Système d'événements et workflows asynchrones avec Inngest

## 📋 Vue d'ensemble

Le boilerplate utilise **Inngest** pour gérer tous les événements asynchrones et workflows complexes :
- 📧 Envoi d'emails en queue
- 🔔 Notifications asynchrones
- 📊 Événements repository (created, updated, deleted)
- 🔄 Workflows multi-étapes (onboarding, etc.)

## 🏗️ Architecture Hybride

### Événements Synchrones (EventEmitter)
Utilisés pour hooks et validations **in-process** :
```typescript
// Événements SYNC - immédiat, bloquant
eventBus.emit('user.before_create', { data })
eventBus.on('user.before_create', (data) => {
  // Validation ou transformation
})
```

### Événements Asynchrones (Inngest)
Utilisés pour workflows **fiables et retryables** :
```typescript
// Événements ASYNC - via Inngest
eventBus.emit('user/created', { record: user }, { async: true })

// Traité par une Inngest Function avec retry automatique
```

## 🎯 Événements Repository Automatiques

Tous les repositories héritant de `BaseRepository` émettent automatiquement des événements :

```typescript
const user = await userRepo.create(userData)
// → Émet automatiquement : 'user/created' (async via Inngest)

await userRepo.update(userId, { name: 'New Name' })
// → Émet automatiquement : 'user/updated' (async via Inngest)

await userRepo.delete(userId)
// → Émet automatiquement : 'user/deleted' (async via Inngest)
```

### Événements disponibles par modèle :
- `{model}.before_create` - Sync (validation)
- `{model}/created` - Async (workflows)
- `{model}.before_update` - Sync (validation)
- `{model}/updated` - Async (workflows)
- `{model}.before_delete` - Sync (validation)
- `{model}/deleted` - Async (workflows)

## 📤 Envoyer des Événements

### Via InngestService (Direct)
```typescript
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'

const inngestService = getService<InngestService>(TYPES.InngestService)

// Envoyer un événement
await inngestService.send({
  name: 'user/registered',
  data: { userId: user.id, email: user.email }
})

// Envoyer plusieurs événements (batch)
await inngestService.sendBatch([
  { name: 'user/created', data: { record: user } },
  { name: 'email/send-welcome', data: { userId: user.id } }
])
```

### Via EventBus (Hybride)
```typescript
const eventBus = getService<EventBusService>(TYPES.EventBus)

// Événement synchrone (immediate)
eventBus.emit('user.validating', { data })

// Événement asynchrone (via Inngest)
eventBus.emit('user/registered', { userId, email }, { async: true })
```

## 🔧 Créer une Inngest Function

### 1. Définir l'événement dans les types
```typescript
// app/shared/types/inngest_events.ts
export interface InngestEvents {
  'user/onboarding-completed': {
    data: {
      userId: string
      completedSteps: number
    }
  }
}
```

### 2. Créer la function
```typescript
// app/auth/functions/user_onboarding_completed.ts
import { inngest } from '#shared/functions/inngest.serve'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'

export const userOnboardingCompleted = inngest.createFunction(
  {
    id: 'user-onboarding-completed',
    name: 'User Onboarding Completed',
    retries: 3,
  },
  { event: 'user/onboarding-completed' },
  async ({ event, step }) => {
    const { userId, completedSteps } = event.data

    // Step 1: Update user stats
    await step.run('update-stats', async () => {
      const userService = getService<UserService>(TYPES.UserService)
      await userService.updateOnboardingStats(userId, completedSteps)
    })

    // Step 2: Send completion email
    await step.run('send-email', async () => {
      const emailService = getService<EmailService>(TYPES.EmailService)
      await emailService.sendOnboardingCompleted(userId)
    })

    // Step 3: Award achievement
    await step.run('award-achievement', async () => {
      // Award badge/points
    })

    return { success: true }
  }
)
```

### 3. Enregistrer la function
```typescript
// app/shared/functions/inngest.serve.ts
import { userOnboardingCompleted } from '#auth/functions/user_onboarding_completed'

export const functions = [
  sendEmailFunction,
  userOnboardingCompleted, // Ajouter ici
  // ... autres functions
]
```

## ⏰ Workflows Multi-Étapes

```typescript
export const userOnboardingWorkflow = inngest.createFunction(
  { id: 'user-onboarding-workflow' },
  { event: 'user/registered' },
  async ({ event, step }) => {

    // Immediate: Send welcome email
    await step.run('send-welcome', async () => {
      await emailService.sendWelcome(event.data.userId)
    })

    // Wait 1 day
    await step.sleep('wait-1-day', '1d')

    // Send tips
    await step.run('send-tips', async () => {
      await emailService.sendOnboardingTips(event.data.userId)
    })

    // Wait 3 days
    await step.sleep('wait-3-days', '3d')

    // Request feedback
    await step.run('request-feedback', async () => {
      await notificationService.requestFeedback(event.data.userId)
    })
  }
)
```

## 🔄 Retry & Rate Limiting

```typescript
export const sendEmailFunction = inngest.createFunction(
  {
    id: 'send-email',
    retries: 3, // Retry jusqu'à 3 fois
    rateLimit: {
      limit: 100,
      period: '1m', // Max 100 emails par minute
    },
  },
  { event: 'email/send-queued' },
  async ({ event }) => {
    // Si échoue, retry automatique avec backoff exponentiel
  }
)
```

## 📊 Dashboard Inngest

### Cloud Dashboard
```
https://app.inngest.com
```

Fonctionnalités :
- ✅ Voir tous les événements en temps réel
- ✅ Tracer l'exécution step-by-step
- ✅ Rejouer les événements en cas d'erreur
- ✅ Monitorer performances et failures
- ✅ Configurer alertes

### Dev Server Local (Optionnel)
```bash
# Terminal 1 : Dev server Inngest
npx inngest-cli dev

# Terminal 2 : App AdonisJS
npm run dev

# Dashboard local : http://localhost:8288
```

## 🔐 Configuration

### Variables d'environnement
```bash
# .env
INNGEST_EVENT_KEY=evt_your_key_here
INNGEST_SIGNING_KEY=signkey_your_key_here

# Pour self-hosted (optionnel)
# INNGEST_BASE_URL=http://localhost:8288
```

### Endpoint API
L'endpoint `/api/inngest` est automatiquement exposé pour que Inngest Cloud puisse appeler vos functions.

## 🎯 Cas d'Usage

### 1. Envoi d'Emails Asynchrone
```typescript
// Au lieu de bloquer la requête
await emailService.send(emailData) // ❌ Bloquant

// Envoyer en queue via Inngest
await emailService.queue(emailData) // ✅ Non-bloquant
```

### 2. Workflows Onboarding
```typescript
// Workflow multi-jours automatique après inscription
eventBus.emit('user/registered', { userId, email }, { async: true })
// → Déclenche automatiquement le workflow onboarding
```

### 3. Webhooks Externes
```typescript
// Appeler une API externe avec retry
export const syncToCRM = inngest.createFunction(
  { id: 'sync-to-crm', retries: 5 },
  { event: 'user/created' },
  async ({ event }) => {
    await fetch('https://crm.example.com/api/users', {
      method: 'POST',
      body: JSON.stringify(event.data)
    })
  }
)
```

### 4. Nettoyage Périodique
```typescript
// Cron job pour nettoyer les tokens expirés
export const cleanupExpiredTokens = inngest.createFunction(
  { id: 'cleanup-expired-tokens' },
  { cron: '0 2 * * *' }, // Tous les jours à 2h du matin
  async ({ step }) => {
    await step.run('cleanup', async () => {
      await passwordResetRepo.deleteExpired()
      await emailVerificationRepo.deleteExpired()
    })
  }
)
```

## 🚀 Migration Self-Hosted

Si vous dépassez 50k events/mois ou avez besoin de self-hosting :

```yaml
# docker-compose.yml
inngest:
  image: inngest/inngest:latest
  command: inngest start
  ports:
    - "8288:8288"
  environment:
    - INNGEST_EVENT_KEY=${INNGEST_EVENT_KEY}
    - INNGEST_SIGNING_KEY=${INNGEST_SIGNING_KEY}
    - INNGEST_POSTGRES_URI=postgresql://...
    - INNGEST_REDIS_URI=redis://...
```

Puis dans `.env` :
```bash
INNGEST_BASE_URL=http://localhost:8288
```

**Aucun changement de code requis** ✅

## 📚 Ressources

- [Documentation Inngest](https://www.inngest.com/docs)
- [Event Schemas Complets](../app/shared/types/inngest_events.ts)
- [Inngest Setup Guide](../docs/setup/inngest-setup.md)

---

**Inngest remplace Bull** pour une meilleure observabilité, fiabilité et developer experience ! 🎉
