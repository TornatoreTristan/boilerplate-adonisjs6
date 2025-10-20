import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from '#users/models/user'
import Organization from '#organizations/models/organization'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { NotificationType } from '#notifications/types/notification'
import type { TranslatableField } from '#shared/helpers/translatable'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare organizationId: string | null

  @column()
  declare type: NotificationType

  @column({
    columnName: 'title_i18n',
    prepare: (value: TranslatableField) => JSON.stringify(value),
    consume: (value: string | TranslatableField) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare titleI18n: TranslatableField

  @column({
    columnName: 'message_i18n',
    prepare: (value: TranslatableField) => JSON.stringify(value),
    consume: (value: string | TranslatableField) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare messageI18n: TranslatableField

  @column({
    prepare: (value: Record<string, any> | null) => JSON.stringify(value),
    consume: (value: string) => (value ? JSON.parse(value) : null),
  })
  declare data: Record<string, any> | null

  @column.dateTime()
  declare readAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deleted_at: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Organization)
  declare organization: BelongsTo<typeof Organization>

  get isRead(): boolean {
    return this.readAt !== null
  }

  get isUnread(): boolean {
    return this.readAt === null
  }

  // Getters for backward compatibility
  get title(): string {
    return this.titleI18n?.fr || this.titleI18n?.en || ''
  }

  get message(): string {
    return this.messageI18n?.fr || this.messageI18n?.en || ''
  }
}
