/**
 * Types pour l'injection de dépendances
 * Utilisation d'un objet pour éviter les conflits de noms
 */
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  OrganizationRepository: Symbol.for('OrganizationRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  PasswordResetRepository: Symbol.for('PasswordResetRepository'),

  // Services
  UserService: Symbol.for('UserService'),
  AuthService: Symbol.for('AuthService'),
  OrganizationService: Symbol.for('OrganizationService'),
  SessionService: Symbol.for('SessionService'),
  PasswordResetService: Symbol.for('PasswordResetService'),

  // Infrastructure
  CacheService: Symbol.for('CacheService'),
  EventBus: Symbol.for('EventBus'),
  QueueService: Symbol.for('QueueService'),
  Logger: Symbol.for('Logger'),

  // External services
  EmailService: Symbol.for('EmailService'),
  RedisClient: Symbol.for('RedisClient'),
} as const

export type ServiceType = keyof typeof TYPES