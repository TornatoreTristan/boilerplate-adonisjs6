# 🚀 AdonisJS 6 Enterprise Boilerplate

> Un boilerplate AdonisJS 6 moderne avec architecture avancée pour applications d'entreprise

[![AdonisJS](https://img.shields.io/badge/AdonisJS-6.x-purple.svg)](https://adonisjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)

**Project start:** 27 sept 2025 | **Last update:** 01 oct 2025 | **Version:** 0.1.1

## ✨ Fonctionnalités

- 🔐 **Authentification complète** - Login/logout avec sessions sécurisées
- 🔑 **Google OAuth** - Connexion avec Google (auto-création et liaison de compte)
- 👥 **Multi-tenant** - Gestion d'organisations avec contexte utilisateur
- 📦 **File Upload System** - Multi-storage (local/S3) avec polymorphic attachments
- 🗄️ **Repository Pattern** - CRUD avancé avec soft deletes et cache Redis
- 🎯 **DDD Architecture** - Domain-Driven Design avec IoC Container (Inversify)
- ⚡ **Performance** - Cache Redis avec invalidation par tags
- 🔍 **Full-Text Search** - Recherche PostgreSQL avec tsvector, GIN indexes et ranking
- 🌍 **Internationalization** - Multi-langue FR/EN avec AdonisJS I18n + React i18next
- 📊 **Audit & Tracking** - Suivi des sessions utilisateur avec UTM/referrer
- 🔧 **Error Handling** - Système d'exceptions personnalisées robuste
- 🎪 **Event System** - Événements asynchrones avec Inngest (workflows, retry, observability)
- 🛡️ **Rate Limiting** - Protection contre les abus avec Redis sliding window
- 🔔 **Notifications** - Système complet avec types personnalisables
- 🧪 **Tests complets** - Unit & functional tests avec Japa

## 🛠️ Stack Technique

- **Backend:** AdonisJS 6 + TypeScript
- **Base de données:** PostgreSQL avec Lucid ORM
- **Cache:** Redis avec stratégie de tags
- **Storage:** Local filesystem + AWS S3
- **Events & Workflows:** Inngest (reliable, observable, avec retry automatique)
- **DI Container:** Inversify pour l'injection de dépendances
- **Tests:** Japa avec couverture complète
- **Frontend:** Inertia.js + React (prêt)

## 🚀 Installation Rapide

```bash
# 1. Clone et installation
git clone https://github.com/votre-username/boilerplate-adonisjs6.git
cd boilerplate-adonisjs6
npm install

# 2. Configuration
cp .env.example .env
# Configurez vos variables d'environnement

# 3. Services (Docker)
docker-compose up -d

# 4. Base de données
node ace migration:run

# 5. Démarrage
npm run dev
```

## 📖 Documentation

- [📐 Architecture Overview](docs/architecture/overview.md)
- [🏗️ Repository Pattern](docs/architecture/repository-pattern.md)
- [🔐 Authentication System](docs/features/authentication.md)
- [🔑 Google OAuth](docs/features/google-oauth.md)
- [🏢 Organizations & Multi-tenancy](docs/features/organizations.md)
- [📦 File Upload System](docs/features/uploads.md)
- [🔔 Notifications](docs/features/notifications.md)
- [⚡ Inngest Event System](docs/features/inngest-events.md)
- [⚡ Caching Strategy](docs/architecture/caching.md)
- [🔍 Full-Text Search](docs/features/full-text-search.md)
- [🌍 Internationalization (i18n)](docs/features/i18n.md)
- [🎯 Error Handling](docs/architecture/error-handling.md)
- [🛡️ Rate Limiting](docs/features/rate-limiting.md)

## 🧪 Tests

```bash
# Tous les tests
npm run test

# Tests avec watch
npm run test -- --watch

# Tests spécifiques
npm run test -- --grep "Repository"
```

## 📊 Architecture Highlights

### Repository Pattern avec BaseRepository

```typescript
// CRUD automatique avec cache et événements
const user = await userRepository.create(userData)
await userRepository.delete(userId, { soft: true })
const restored = await userRepository.restore(userId)
```

### Container IoC avec Inversify

```typescript
// Injection de dépendances automatique
@injectable()
class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: UserRepository,
    @inject(TYPES.CacheService) private cache: CacheService
  ) {}
}
```

### Inngest Event System

```typescript
// Événements asynchrones avec retry automatique
await inngestService.send({
  name: 'user/registered',
  data: { userId: user.id, email: user.email }
})

// Workflows multi-étapes avec observability
inngest.createFunction(
  { id: 'onboarding', retries: 3 },
  { event: 'user/registered' },
  async ({ event, step }) => {
    await step.run('send-welcome', () => emailService.send(...))
    await step.sleep('wait-1-day', '1d')
    await step.run('send-tips', () => emailService.send(...))
  }
)
```

### Cache Redis avec Tags

```typescript
// Invalidation intelligente par tags
await cache.set('user:123', user, { tags: ['users', 'user_123'] })
await cache.invalidateTags(['users']) // Invalide tous les utilisateurs
```

### File Upload Multi-Storage

```typescript
// Upload vers S3 avec polymorphic attachment
const upload = await uploadService.uploadFile({
  userId: user.id,
  file: fileBuffer,
  filename: 'avatar.jpg',
  disk: 's3',
  visibility: 'public',
  uploadableType: 'User',
  uploadableId: user.id,
})
```

## 🏗️ Structure du Projet

```
app/
├── auth/                 # Authentification
├── organizations/        # Multi-tenant
├── users/               # Gestion utilisateurs
├── sessions/            # Tracking sessions
├── uploads/             # File upload system
├── notifications/       # Système de notifications
├── shared/              # Code partagé
│   ├── container/       # IoC Container
│   ├── repositories/    # BaseRepository
│   ├── services/        # Services métier
│   └── exceptions/      # Gestion erreurs
docs/                    # Documentation
tests/                   # Tests complets
```

## 🎯 Prochaines Étapes

- [x] API Rate Limiting
- [x] Google OAuth Integration
- [x] File Upload System (Local + S3)
- [x] Notifications System
- [x] Full-Text Search (PostgreSQL)
- [x] Internationalization (FR/EN)
- [ ] Multi-provider OAuth (GitHub, Facebook)
- [ ] Super-admin Dashboard
- [ ] WebSocket Real-time
- [ ] Email Templates & Mailing

## 🤝 Contribution

Ce boilerplate est conçu pour être un point de départ solide pour vos applications d'entreprise. N'hésitez pas à l'adapter selon vos besoins !

---

**Développé avec ❤️ en utilisant AdonisJS 6**
