import type { HttpContext } from '@adonisjs/core/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type SubscriptionService from '#billing/services/subscription_service'
import { E } from '#shared/exceptions/index'
import vine from '@vinejs/vine'

const createCheckoutSessionValidator = vine.compile(
  vine.object({
    planId: vine.string().trim(),
    billingInterval: vine.enum(['month', 'year']),
  })
)

export default class SubscriptionsController {
  /**
   * Créer une session Stripe Checkout pour souscrire à un plan
   */
  async createCheckoutSession({ request, response, user, organization, inertia }: HttpContext) {
    E.assertUserExists(user)
    E.assertOrganizationExists(organization)

    const data = await request.validateUsing(createCheckoutSessionValidator)

    const subscriptionService = getService<SubscriptionService>(TYPES.SubscriptionService)

    const baseUrl = request.completeUrl(true)
    const successUrl = `${baseUrl}/organizations/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/organizations/pricing`

    const checkoutUrl = await subscriptionService.createCheckoutSession(
      organization.id,
      data.planId,
      data.billingInterval,
      successUrl,
      cancelUrl
    )

    // Utiliser Inertia location pour redirection externe
    return inertia.location(checkoutUrl)
  }

  /**
   * Page de succès après paiement Stripe
   */
  async success({ inertia, request }: HttpContext) {
    const sessionId = request.qs().session_id

    return inertia.render('billing/subscription-success', {
      sessionId,
    })
  }

  /**
   * Page d'annulation (retour depuis Stripe)
   */
  async cancel({ response }: HttpContext) {
    return response.redirect('/organizations/pricing')
  }
}
