import { injectable, inject } from 'inversify'
import { TYPES } from '#shared/container/types'
import type DatabaseHealthCheck from './health_checks/database_health_check.js'
import type RedisHealthCheck from './health_checks/redis_health_check.js'
import type DiskHealthCheck from './health_checks/disk_health_check.js'
import type EmailHealthCheck from './health_checks/email_health_check.js'
import type { HealthResponse, HealthStatus, HealthCheckResult } from '#health/types/health'

@injectable()
export default class HealthService {
  private readonly startTime: number

  constructor(
    @inject(TYPES.DatabaseHealthCheck) private databaseCheck: DatabaseHealthCheck,
    @inject(TYPES.RedisHealthCheck) private redisCheck: RedisHealthCheck,
    @inject(TYPES.DiskHealthCheck) private diskCheck: DiskHealthCheck,
    @inject(TYPES.EmailHealthCheck) private emailCheck: EmailHealthCheck
  ) {
    this.startTime = Date.now()
  }

  async liveness(): Promise<HealthResponse> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: this.getUptimeSeconds(),
    }
  }

  async readiness(): Promise<HealthResponse> {
    const [databaseResult, redisResult] = await Promise.all([
      this.databaseCheck.check(),
      this.redisCheck.check(),
    ])

    const checks = {
      database: databaseResult,
      redis: redisResult,
    }

    const status = this.determineOverallStatus([databaseResult, redisResult])

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: this.getUptimeSeconds(),
      checks,
    }
  }

  async deep(): Promise<HealthResponse> {
    const [databaseResult, redisResult, diskResult, emailResult] = await Promise.all([
      this.databaseCheck.check(),
      this.redisCheck.check(),
      this.diskCheck.check(),
      this.emailCheck.check(),
    ])

    const checks = {
      database: databaseResult,
      redis: redisResult,
      disk: diskResult,
      email: emailResult,
    }

    const criticalResults = [databaseResult, redisResult, diskResult]
    const status = this.determineOverallStatus(criticalResults)

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: this.getUptimeSeconds(),
      checks,
    }
  }

  private determineOverallStatus(results: HealthCheckResult[]): HealthStatus {
    const hasDown = results.some((result) => result.status === 'down')
    if (hasDown) {
      return 'down'
    }

    const hasDegraded = results.some((result) => result.status === 'degraded')
    if (hasDegraded) {
      return 'degraded'
    }

    return 'ok'
  }

  private getUptimeSeconds(): number {
    return Math.floor((Date.now() - this.startTime) / 1000)
  }
}
