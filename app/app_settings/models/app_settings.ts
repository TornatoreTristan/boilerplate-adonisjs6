import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Upload from '#uploads/models/upload'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AppSettings extends BaseModel {
  static table = 'app_settings'

  @column({ isPrimary: true })
  declare id: string

  // Application branding
  @column()
  declare appName: string

  @column()
  declare logoId: string | null

  @column()
  declare faviconId: string | null

  // Legal documents
  @column()
  declare termsOfService: string | null

  @column()
  declare termsOfSale: string | null

  @column()
  declare privacyPolicy: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Upload, {
    foreignKey: 'logoId',
  })
  declare logo: BelongsTo<typeof Upload>

  @belongsTo(() => Upload, {
    foreignKey: 'faviconId',
  })
  declare favicon: BelongsTo<typeof Upload>
}
