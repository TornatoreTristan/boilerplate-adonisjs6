import type { HttpContext } from '@adonisjs/core/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type HealthService from '#health/services/health_service'

export default class HealthController {
  async liveness({ response }: HttpContext) {
    const healthService = getService<HealthService>(TYPES.HealthService)
    const result = await healthService.liveness()

    return response.status(200).json(result)
  }

  async readiness({ response }: HttpContext) {
    const healthService = getService<HealthService>(TYPES.HealthService)
    const result = await healthService.readiness()

    const statusCode = result.status === 'down' ? 503 : 200

    return response.status(statusCode).json(result)
  }
}
