import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { HealthStatus } from '#health/types/health'

export default class HealthHistory extends BaseModel {
  static table = 'health_history'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare status: HealthStatus

  @column({
    prepare: (value: Record<string, any>) => JSON.stringify(value),
    consume: (value: string | Record<string, any>) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare healthData: Record<string, any>

  @column({
    prepare: (value: Record<string, any>) => JSON.stringify(value),
    consume: (value: string | Record<string, any>) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare metricsData: Record<string, any>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
