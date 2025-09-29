import 'reflect-metadata'
import { Container } from 'inversify'
import Redis from 'ioredis'
import Queue from 'bull'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import { TYPES } from './types.js'

// Services
import CacheService from '#shared/services/cache_service'
import EventBusService from '#shared/services/event_bus_service'
import QueueService from '#shared/services/queue_service'

// Repositories
import UserRepository from '#users/repositories/user_repository'
import OrganizationRepository from '#organizations/repositories/organization_repository'
import SessionRepository from '#sessions/repositories/session_repository'

// Create container
const container = new Container()

/**
 * Configuration du container IoC
 */
export function configureContainer(): Container {
  // ==========================================
  // INFRASTRUCTURE
  // ==========================================

  // Redis client
  container.bind<Redis>(TYPES.RedisClient).toDynamicValue(() => {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    }

    return new Redis(redisConfig)
  }).inSingletonScope()

  // Logger
  container.bind(TYPES.Logger).toConstantValue(logger)

  // Cache Service
  container.bind<CacheService>(TYPES.CacheService).to(CacheService).inSingletonScope()

  // Queue Service
  container.bind<QueueService>(TYPES.QueueService).to(QueueService).inSingletonScope()

  // Event Bus
  container.bind<EventBusService>(TYPES.EventBus).to(EventBusService).inSingletonScope()

  // ==========================================
  // REPOSITORIES
  // ==========================================

  container.bind(TYPES.UserRepository).to(UserRepository)
  container.bind(TYPES.OrganizationRepository).to(OrganizationRepository)
  container.bind(TYPES.SessionRepository).to(SessionRepository)

  // ==========================================
  // SERVICES (à migrer)
  // ==========================================
  // container.bind<UserService>(TYPES.UserService).to(UserService)
  // container.bind<AuthService>(TYPES.AuthService).to(AuthService)

  return container
}

// Export du container configuré
export const serviceContainer = configureContainer()

// Helper pour récupérer un service
export function getService<T>(serviceIdentifier: symbol): T {
  return serviceContainer.get<T>(serviceIdentifier)
}

// Helper pour checker si l'app est en test
export function isTestEnvironment(): boolean {
  return app.inTest
}