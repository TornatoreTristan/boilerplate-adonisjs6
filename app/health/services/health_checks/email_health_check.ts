import { injectable, inject } from 'inversify'
import { TYPES } from '#shared/container/types'
import type QueueService from '#shared/services/queue_service'
import { BaseHealthCheck } from './base_health_check.js'
import type { HealthCheckResult } from '#health/types/health'

@injectable()
export default class EmailHealthCheck extends BaseHealthCheck {
  name = 'email'

  constructor(@inject(TYPES.QueueService) private queueService: QueueService) {
    super()
    this.config.timeout = 3000
    this.config.critical = false
  }

  async check(): Promise<HealthCheckResult> {
    try {
      const { result, latency } = await this.measureLatency(async () => {
        return await this.withTimeout(this.getQueueStats(), this.config.timeout)
      })

      const totalPending = result.waiting + result.active + result.delayed
      const hasFailed = result.failed > 10
      const hasStuckJobs = result.active > 50

      const status = hasFailed || hasStuckJobs ? 'degraded' : 'ok'

      return {
        status,
        latency,
        details: {
          waiting: result.waiting,
          active: result.active,
          completed: result.completed,
          failed: result.failed,
          delayed: result.delayed,
          totalPending,
        },
      }
    } catch (error) {
      return {
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Unknown email queue error',
      }
    }
  }

  private async getQueueStats() {
    const queue = this.queueService.getQueue('email')

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ])

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
    }
  }
}
