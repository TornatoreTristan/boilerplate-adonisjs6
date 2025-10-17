import router from '@adonisjs/core/services/router'

const StripeWebhookController = () => import('#billing/controllers/stripe_webhook_controller')

// Webhooks Stripe - pas d'authentification ni de CSRF
router.post('/webhooks/stripe', [StripeWebhookController, 'handle'])
