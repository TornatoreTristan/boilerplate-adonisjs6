import { injectable } from 'inversify'
import { BaseRepository } from '#shared/repositories/base_repository'
import Subscription from '#billing/models/subscription'
import type { SubscriptionStatus } from '#billing/models/subscription'

@injectable()
export default class SubscriptionRepository extends BaseRepository<typeof Subscription> {
  protected model = Subscription

  async findByOrganizationId(organizationId: string): Promise<Subscription[]> {
    return this.buildBaseQuery()
      .where('organization_id', organizationId)
      .preload('plan')
      .orderBy('created_at', 'desc')
  }

  async findActiveByOrganizationId(organizationId: string): Promise<Subscription | null> {
    const subscriptions = await this.buildBaseQuery()
      .where('organization_id', organizationId)
      .whereIn('status', ['active', 'trialing', 'past_due'])
      .preload('plan')
      .orderBy('created_at', 'desc')
      .limit(1)

    return subscriptions[0] || null
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return this.findOneBy({ stripeSubscriptionId })
  }

  async findByStatus(status: SubscriptionStatus): Promise<Subscription[]> {
    return this.buildBaseQuery()
      .where('status', status)
      .preload('plan')
      .preload('organization')
  }

  async findByPlanId(planId: string): Promise<Subscription[]> {
    return this.buildBaseQuery()
      .where('plan_id', planId)
      .preload('organization')
      .orderBy('created_at', 'desc')
  }

  async countByPlanId(planId: string): Promise<number> {
    const result = await this.buildBaseQuery()
      .where('plan_id', planId)
      .where('status', 'active')
      .count('* as total')

    return Number(result[0].$extras.total)
  }
}
