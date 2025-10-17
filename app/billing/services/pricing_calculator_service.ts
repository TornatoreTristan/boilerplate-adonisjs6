import { injectable } from 'inversify'
import Plan, { type PricingTier } from '#billing/models/plan'
import { E } from '#shared/exceptions/exception_helpers'

@injectable()
export default class PricingCalculatorService {
  calculatePrice(plan: Plan, userCount: number): number {
    if (userCount < 1) {
      E.fieldInvalid('userCount', userCount, { message: 'User count must be at least 1' })
    }

    switch (plan.pricingModel) {
      case 'flat':
        return this.calculateFlatPrice(plan)

      case 'per_seat':
        return this.calculatePerSeatPrice(plan, userCount)

      case 'tiered':
        return this.calculateTieredPrice(plan, userCount)

      case 'volume':
        return this.calculateVolumePrice(plan, userCount)

      default:
        E.fieldInvalid('pricingModel', plan.pricingModel)
    }
  }

  calculateQuantity(plan: Plan, userCount: number): number {
    switch (plan.pricingModel) {
      case 'flat':
        return 1

      case 'per_seat':
        if (!plan.baseUsers) {
          return userCount
        }
        return Math.max(userCount - plan.baseUsers, 0) + 1

      case 'tiered':
      case 'volume':
        return userCount

      default:
        return 1
    }
  }

  private calculateFlatPrice(plan: Plan): number {
    return plan.price
  }

  private calculatePerSeatPrice(plan: Plan, userCount: number): number {
    if (!plan.pricePerUser) {
      E.validationError('Per-seat pricing requires pricePerUser to be set', 'pricePerUser')
    }

    const baseUsers = plan.baseUsers || 0
    const basePrice = plan.price

    if (userCount <= baseUsers) {
      return basePrice
    }

    const additionalUsers = userCount - baseUsers
    return basePrice + additionalUsers * plan.pricePerUser
  }

  private calculateTieredPrice(plan: Plan, userCount: number): number {
    if (!plan.pricingTiers || plan.pricingTiers.length === 0) {
      E.validationError('Tiered pricing requires pricingTiers to be set', 'pricingTiers')
    }

    const tier = this.findTierForUserCount(plan.pricingTiers, userCount)

    if (!tier) {
      E.validationError(`No pricing tier found for ${userCount} users`, 'pricingTiers')
    }

    if (tier.price === undefined) {
      E.validationError('Tiered pricing tier must have a price property', 'pricingTiers')
    }

    return tier.price
  }

  private calculateVolumePrice(plan: Plan, userCount: number): number {
    if (!plan.pricingTiers || plan.pricingTiers.length === 0) {
      E.validationError('Volume pricing requires pricingTiers to be set', 'pricingTiers')
    }

    let totalPrice = 0
    let remainingUsers = userCount

    const sortedTiers = this.sortTiers(plan.pricingTiers)

    for (const tier of sortedTiers) {
      if (remainingUsers <= 0) break

      if (tier.pricePerUser === undefined) {
        E.validationError('Volume pricing tier must have a pricePerUser property', 'pricingTiers')
      }

      const tierCapacity = tier.maxUsers ? tier.maxUsers - tier.minUsers + 1 : Infinity
      const usersInTier = Math.min(remainingUsers, tierCapacity)

      totalPrice += usersInTier * tier.pricePerUser
      remainingUsers -= usersInTier
    }

    return totalPrice
  }

  private findTierForUserCount(tiers: PricingTier[], userCount: number): PricingTier | null {
    for (const tier of tiers) {
      const meetsMin = userCount >= tier.minUsers
      const meetsMax = tier.maxUsers === null || userCount <= tier.maxUsers

      if (meetsMin && meetsMax) {
        return tier
      }
    }

    return null
  }

  private sortTiers(tiers: PricingTier[]): PricingTier[] {
    return [...tiers].sort((a, b) => a.minUsers - b.minUsers)
  }
}
