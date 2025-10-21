import { injectable, inject } from 'inversify'
import { TYPES } from '#shared/container/types'
import type HealthService from './health_service.js'
import type MetricsService from './metrics_service.js'
import type HealthHistoryService from './health_history_service.js'
import { DateTime } from 'luxon'

export interface MonitoringData {
  status: string
  timestamp: string
  uptime: number
  health: {
    database: any
    redis: any
    disk: any
    email: any
  }
  metrics: {
    process: any
    system: any
    cache: any
  }
}

@injectable()
export default class MonitoringService {
  constructor(
    @inject(TYPES.HealthService) private healthService: HealthService,
    @inject(TYPES.MetricsService) private metricsService: MetricsService,
    @inject(TYPES.HealthHistoryService) private historyService: HealthHistoryService
  ) {}

  async getFullMonitoringData(): Promise<MonitoringData> {
    const healthData = await this.healthService.deep()

    const [processMetrics, systemMetrics, cacheMetrics] = await Promise.all([
      this.metricsService.getProcessMetrics(),
      Promise.resolve(this.metricsService.getSystemMetrics()),
      this.metricsService.getCacheMetrics(),
    ])

    const data: MonitoringData = {
      status: healthData.status,
      timestamp: healthData.timestamp,
      uptime: healthData.uptime || 0,
      health: {
        database: healthData.checks?.database,
        redis: healthData.checks?.redis,
        disk: healthData.checks?.disk,
        email: healthData.checks?.email,
      },
      metrics: {
        process: processMetrics,
        system: systemMetrics,
        cache: cacheMetrics,
      },
    }

    await this.saveSnapshot(data)

    return data
  }

  async getHistoryLast24Hours() {
    return this.historyService.getLast24Hours()
  }

  async getHistoryForPeriod(startDate: DateTime, endDate: DateTime) {
    return this.historyService.getHistoryForPeriod(startDate, endDate)
  }

  private async saveSnapshot(data: MonitoringData): Promise<void> {
    try {
      await this.historyService.saveSnapshot(data.status, data.health, data.metrics)
    } catch (error) {
      console.error('Failed to save monitoring snapshot:', error)
    }
  }
}
