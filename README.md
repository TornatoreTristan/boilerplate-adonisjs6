# 🚀 AdonisJS 6 Enterprise Boilerplate

> Un boilerplate AdonisJS 6 moderne avec architecture avancée pour applications d'entreprise

[![AdonisJS](https://img.shields.io/badge/AdonisJS-6.x-purple.svg)](https://adonisjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)

**Project start:** 27 sept 2025 | **Last update:** 29 sept 2025 | **Version:** 0.1.0

## ✨ Fonctionnalités

- 🔐 **Authentification complète** - Login/logout avec sessions sécurisées
- 🔑 **Google OAuth** - Connexion avec Google (auto-création et liaison de compte)
- 👥 **Multi-tenant** - Gestion d'organisations avec contexte utilisateur
- 🗄️ **Repository Pattern** - CRUD avancé avec soft deletes et cache Redis
- 🎯 **DDD Architecture** - Domain-Driven Design avec IoC Container (Inversify)
- ⚡ **Performance** - Cache Redis avec invalidation par tags
- 📊 **Audit & Tracking** - Suivi des sessions utilisateur avec UTM/referrer
- 🔧 **Error Handling** - Système d'exceptions personnalisées robuste
- 🎪 **Event System** - Bus d'événements avec Bull queues
- 🛡️ **Rate Limiting** - Protection contre les abus avec Redis sliding window
- 🧪 **Tests complets** - Unit & functional tests avec Japa

## 🛠️ Stack Technique

- **Backend:** AdonisJS 6 + TypeScript
- **Base de données:** PostgreSQL avec Lucid ORM
- **Cache:** Redis avec stratégie de tags
- **Queues:** Bull pour les événements asynchrones
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
- [⚡ Caching Strategy](docs/architecture/caching.md)
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

### Cache Redis avec Tags
```typescript
// Invalidation intelligente par tags
await cache.set('user:123', user, { tags: ['users', 'user_123'] })
await cache.invalidateTags(['users']) // Invalide tous les utilisateurs
```

## 🏗️ Structure du Projet

```
app/
├── auth/                 # Authentification
├── organizations/        # Multi-tenant
├── users/               # Gestion utilisateurs
├── sessions/            # Tracking sessions
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
- [ ] Multi-provider OAuth (GitHub, Facebook)
- [ ] Super-admin Dashboard
- [ ] WebSocket Real-time
- [ ] File Upload System

## 🤝 Contribution

Ce boilerplate est conçu pour être un point de départ solide pour vos applications d'entreprise. N'hésitez pas à l'adapter selon vos besoins !

---

**Développé avec ❤️ en utilisant AdonisJS 6**
