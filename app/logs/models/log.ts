import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#users/models/user'
import type { LogLevel, LogContext } from '#logs/types/log'

export default class Log extends BaseModel {
  static table = 'logs'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare level: LogLevel

  @column()
  declare message: string

  @column({
    prepare: (value: LogContext | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | LogContext | null) => {
      if (value === null) return null
      return typeof value === 'string' ? JSON.parse(value) : value
    },
  })
  declare context: LogContext | null

  @column()
  declare userId: string | null

  @column()
  declare ip: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare method: string | null

  @column()
  declare url: string | null

  @column()
  declare statusCode: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
