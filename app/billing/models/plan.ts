import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Subscription from './subscription.js'

export type PlanInterval = 'month' | 'year'
export type PricingModel = 'flat' | 'per_seat' | 'tiered' | 'volume'

export interface PricingTier {
  minUsers: number
  maxUsers: number | null
  price?: number
  pricePerUser?: number
}

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column()
  declare stripeProductId: string | null

  @column()
  declare stripePriceIdMonthly: string | null

  @column()
  declare stripePriceIdYearly: string | null

  @column()
  declare priceMonthly: number

  @column()
  declare priceYearly: number

  @column()
  declare currency: string

  @column()
  declare pricingModel: PricingModel

  @column({
    prepare: (value: PricingTier[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | PricingTier[] | null) => {
      if (value === null) return null
      if (typeof value === 'string') {
        return value ? JSON.parse(value) : null
      }
      return value || null
    },
  })
  declare pricingTiers: PricingTier[] | null

  @column()
  declare trialDays: number | null

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | string[] | null) => {
      if (value === null) return null
      if (typeof value === 'string') {
        return value ? JSON.parse(value) : null
      }
      return value || null
    },
  })
  declare features: string[] | null

  @column({
    prepare: (value: Record<string, any> | null) =>
      value ? JSON.stringify(value) : null,
    consume: (value: string | Record<string, any> | null) => {
      if (value === null) return null
      if (typeof value === 'string') {
        return value ? JSON.parse(value) : null
      }
      return value || null
    },
  })
  declare limits: Record<string, any> | null

  @column()
  declare isActive: boolean

  @column()
  declare isVisible: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Subscription)
  declare subscriptions: HasMany<typeof Subscription>
}
