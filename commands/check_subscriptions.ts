import { BaseCommand } from '@adonisjs/core/ace'
import Subscription from '#billing/models/subscription'
import Organization from '#organizations/models/organization'

export default class CheckSubscriptions extends BaseCommand {
  static commandName = 'check:subscriptions'
  static description = 'Check subscriptions in database'

  async run() {
    const subscriptions = await Subscription.query()
      .preload('plan')
      .preload('organization')
      .orderBy('created_at', 'desc')
      .limit(10)

    this.logger.info(`Total subscriptions: ${subscriptions.length}`)

    if (subscriptions.length > 0) {
      subscriptions.forEach((sub) => {
        this.logger.info(
          `- ID: ${sub.id}, Org: ${sub.organization.name}, Plan: ${sub.plan.name}, Status: ${sub.status}, Stripe: ${sub.stripeSubscriptionId || 'N/A'}`
        )
      })
    } else {
      this.logger.warning('No subscriptions found in database')
    }

    const organizations = await Organization.query()
    this.logger.info(`\nTotal organizations: ${organizations.length}`)
    organizations.forEach((org) => {
      this.logger.info(`- ${org.id}: ${org.name}`)
    })
  }
}
