import type { HttpContext } from '@adonisjs/core/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type SubscriptionRepository from '#billing/repositories/subscription_repository'
import type PlanRepository from '#billing/repositories/plan_repository'
import Stripe from 'stripe'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export default class StripeWebhookController {
  /**
   * Gérer les webhooks Stripe
   */
  async handle({ request, response }: HttpContext) {
    const signature = request.header('stripe-signature')
    const webhookSecret = env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature) {
      logger.warn('Webhook Stripe reçu sans signature')
      return response.badRequest({ error: 'Missing signature' })
    }

    if (!webhookSecret) {
      logger.error('STRIPE_WEBHOOK_SECRET non configuré')
      return response.internalServerError({ error: 'Webhook secret not configured' })
    }

    const stripe = new Stripe(env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
    })

    let event: Stripe.Event

    try {
      // Vérifier la signature du webhook
      event = stripe.webhooks.constructEvent(request.raw(), signature, webhookSecret)
    } catch (err) {
      logger.warn({ err }, 'Signature webhook Stripe invalide')
      return response.badRequest({ error: 'Invalid signature' })
    }

    logger.info({ type: event.type }, 'Webhook Stripe reçu')

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
          break

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break

        default:
          logger.info({ type: event.type }, 'Événement webhook non géré')
      }

      return response.ok({ received: true })
    } catch (error) {
      logger.error({ error, eventType: event.type }, 'Erreur lors du traitement du webhook')
      return response.internalServerError({ error: 'Webhook processing failed' })
    }
  }

  /**
   * Gérer la fin d'un checkout (création d'abonnement)
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    logger.info({ sessionId: session.id }, 'Traitement checkout.session.completed')

    const subscriptionRepo = getService<SubscriptionRepository>(TYPES.SubscriptionRepository)
    const planRepo = getService<PlanRepository>(TYPES.PlanRepository)

    const organizationId = session.metadata?.organizationId
    const planId = session.metadata?.planId

    logger.info({ organizationId, planId, metadata: session.metadata }, 'Metadata extraites')

    if (!organizationId || !planId) {
      logger.warn({ sessionId: session.id, metadata: session.metadata }, 'Metadata manquantes dans la session checkout')
      return
    }

    const stripeSubscriptionId = session.subscription as string
    if (!stripeSubscriptionId) {
      logger.warn({ sessionId: session.id }, 'Pas de subscription dans la session')
      return
    }

    logger.info({ stripeSubscriptionId }, 'Récupération de la subscription Stripe')

    // Récupérer les détails de l'abonnement Stripe
    const stripe = new Stripe(env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
    })
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)

    const plan = await planRepo.findByIdOrFail(planId)

    // Déterminer le billing interval
    const billingInterval = stripeSubscription.items.data[0].plan.interval as 'month' | 'year'

    // Vérifier si un abonnement existe déjà
    const existingSubscription = await subscriptionRepo.findByStripeSubscriptionId(
      stripeSubscriptionId
    )

    if (existingSubscription) {
      logger.info(
        { subscriptionId: existingSubscription.id },
        'Abonnement déjà existant, mise à jour'
      )
      await subscriptionRepo.update(existingSubscription.id, {
        status: stripeSubscription.status as any,
        currentPeriodStart: DateTime.fromSeconds(stripeSubscription.current_period_start),
        currentPeriodEnd: DateTime.fromSeconds(stripeSubscription.current_period_end),
        trialEndsAt: stripeSubscription.trial_end
          ? DateTime.fromSeconds(stripeSubscription.trial_end)
          : null,
      })
    } else {
      // Créer le nouvel abonnement
      logger.info({ organizationId, planId, billingInterval }, 'Création du nouvel abonnement')

      // Récupérer le prix depuis le plan
      const price = billingInterval === 'month' ? plan.priceMonthly : plan.priceYearly

      try {
        const newSubscription = await subscriptionRepo.create({
          organizationId,
          planId,
          stripeSubscriptionId,
          stripeCustomerId: stripeSubscription.customer as string,
          stripeSubscriptionItemId: stripeSubscription.items.data[0].id,
          stripePriceId: stripeSubscription.items.data[0].price.id,
          quantity: stripeSubscription.items.data[0].quantity || 1,
          userCount: 1,
          billingInterval,
          price,
          currency: plan.currency,
          status: stripeSubscription.status as any,
          currentPeriodStart: DateTime.fromSeconds(stripeSubscription.current_period_start),
          currentPeriodEnd: DateTime.fromSeconds(stripeSubscription.current_period_end),
          trialEndsAt: stripeSubscription.trial_end
            ? DateTime.fromSeconds(stripeSubscription.trial_end)
            : null,
          canceledAt: null,
        } as any)

        logger.info({ subscriptionId: newSubscription.id, organizationId, planId }, 'Nouvel abonnement créé avec succès')
      } catch (error) {
        logger.error({ error, organizationId, planId }, 'Erreur lors de la création de l\'abonnement')
        throw error
      }
    }
  }

  /**
   * Gérer la mise à jour d'un abonnement
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const subscriptionRepo = getService<SubscriptionRepository>(TYPES.SubscriptionRepository)

    const subscription = await subscriptionRepo.findByStripeSubscriptionId(stripeSubscription.id)

    if (!subscription) {
      logger.warn(
        { stripeSubscriptionId: stripeSubscription.id },
        'Abonnement non trouvé pour mise à jour'
      )
      return
    }

    await subscriptionRepo.update(subscription.id, {
      status: stripeSubscription.status as any,
      currentPeriodStart: DateTime.fromSeconds(stripeSubscription.current_period_start),
      currentPeriodEnd: DateTime.fromSeconds(stripeSubscription.current_period_end),
      trialEndsAt: stripeSubscription.trial_end
        ? DateTime.fromSeconds(stripeSubscription.trial_end)
        : null,
      canceledAt: stripeSubscription.canceled_at
        ? DateTime.fromSeconds(stripeSubscription.canceled_at)
        : null,
    })

    logger.info({ subscriptionId: subscription.id }, 'Abonnement mis à jour')
  }

  /**
   * Gérer la suppression d'un abonnement
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    const subscriptionRepo = getService<SubscriptionRepository>(TYPES.SubscriptionRepository)

    const subscription = await subscriptionRepo.findByStripeSubscriptionId(stripeSubscription.id)

    if (!subscription) {
      logger.warn(
        { stripeSubscriptionId: stripeSubscription.id },
        'Abonnement non trouvé pour suppression'
      )
      return
    }

    await subscriptionRepo.update(subscription.id, {
      status: 'canceled',
      canceledAt: DateTime.now(),
    })

    logger.info({ subscriptionId: subscription.id }, 'Abonnement annulé')
  }

  /**
   * Gérer le paiement réussi d'une facture
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    logger.info({ invoiceId: invoice.id }, 'Paiement de facture réussi')
  }

  /**
   * Gérer l'échec de paiement d'une facture
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionRepo = getService<SubscriptionRepository>(TYPES.SubscriptionRepository)

    if (!invoice.subscription) return

    const subscription = await subscriptionRepo.findByStripeSubscriptionId(
      invoice.subscription as string
    )

    if (!subscription) {
      logger.warn({ invoiceId: invoice.id }, 'Abonnement non trouvé pour échec de paiement')
      return
    }

    await subscriptionRepo.update(subscription.id, {
      status: 'past_due',
    })

    logger.warn({ subscriptionId: subscription.id, invoiceId: invoice.id }, 'Échec de paiement')
  }
}
