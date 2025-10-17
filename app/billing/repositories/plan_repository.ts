import { injectable } from 'inversify'
import { BaseRepository } from '#shared/repositories/base_repository'
import Plan from '#billing/models/plan'

@injectable()
export default class PlanRepository extends BaseRepository<typeof Plan> {
  protected model = Plan

  async findBySlug(slug: string): Promise<Plan | null> {
    return this.findOneBy({ slug })
  }

  async findActiveAndVisible(): Promise<Plan[]> {
    return this.buildBaseQuery()
      .where('is_active', true)
      .where('is_visible', true)
      .orderBy('sort_order', 'asc')
      .orderBy('price', 'asc')
  }

  async findByStripeProductId(stripeProductId: string): Promise<Plan | null> {
    return this.findOneBy({ stripeProductId })
  }

  async findByStripePriceId(stripePriceId: string): Promise<Plan | null> {
    return this.findOneBy({ stripePriceId })
  }

  async activePlans(): Promise<Plan[]> {
    return this.findBy({ isActive: true })
  }
}
