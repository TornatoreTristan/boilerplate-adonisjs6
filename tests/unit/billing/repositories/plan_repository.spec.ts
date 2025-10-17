import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import PlanRepository from '#billing/repositories/plan_repository'

test.group('PlanRepository', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should create a plan with flat pricing', async ({ assert }) => {
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    const plan = await planRepository.create({
      name: 'Starter',
      slug: 'starter',
      description: 'Plan de démarrage',
      price: 0,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'flat',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: null,
      trialDays: 14,
      features: ['1 utilisateur', 'Support email'],
      limits: { maxUsers: 1 },
      isActive: true,
      isVisible: true,
      sortOrder: 0,
      stripeProductId: null,
      stripePriceId: null,
    })

    assert.exists(plan.id)
    assert.equal(plan.name, 'Starter')
    assert.equal(plan.slug, 'starter')
    assert.equal(plan.price, 0)
    assert.equal(plan.currency, 'EUR')
    assert.equal(plan.interval, 'month')
    assert.equal(plan.pricingModel, 'flat')
    assert.equal(plan.trialDays, 14)
    assert.deepEqual(plan.features, ['1 utilisateur', 'Support email'])
    assert.deepEqual(plan.limits, { maxUsers: 1 })
    assert.isTrue(plan.isActive)
    assert.isTrue(plan.isVisible)
  })

  test('should create a plan with per-seat pricing', async ({ assert }) => {
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    const plan = await planRepository.create({
      name: 'Pro',
      slug: 'pro',
      description: 'Plan pro',
      price: 29,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'per_seat',
      baseUsers: 5,
      pricePerUser: 5,
      pricingTiers: null,
      trialDays: null,
      features: null,
      limits: null,
      isActive: true,
      isVisible: true,
      sortOrder: 0,
      stripeProductId: null,
      stripePriceId: null,
    })

    assert.equal(plan.pricingModel, 'per_seat')
    assert.equal(plan.baseUsers, 5)
    assert.equal(plan.pricePerUser, 5)
  })

  test('should create a plan with tiered pricing', async ({ assert }) => {
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    const plan = await planRepository.create({
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Plan entreprise',
      price: 0,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'tiered',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: [
        { minUsers: 1, maxUsers: 10, price: 99 },
        { minUsers: 11, maxUsers: 50, price: 249 },
        { minUsers: 51, maxUsers: null, price: 499 },
      ],
      trialDays: null,
      features: null,
      limits: null,
      isActive: true,
      isVisible: true,
      sortOrder: 0,
      stripeProductId: null,
      stripePriceId: null,
    })

    assert.equal(plan.pricingModel, 'tiered')
    assert.isArray(plan.pricingTiers)
    assert.lengthOf(plan.pricingTiers!, 3)
  })

  test('should create a plan with volume pricing', async ({ assert }) => {
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    const plan = await planRepository.create({
      name: 'Volume',
      slug: 'volume',
      description: 'Plan volume',
      price: 0,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'volume',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: [
        { minUsers: 1, maxUsers: 10, pricePerUser: 10 },
        { minUsers: 11, maxUsers: 50, pricePerUser: 8 },
        { minUsers: 51, maxUsers: null, pricePerUser: 5 },
      ],
      trialDays: null,
      features: null,
      limits: null,
      isActive: true,
      isVisible: true,
      sortOrder: 0,
      stripeProductId: null,
      stripePriceId: null,
    })

    assert.equal(plan.pricingModel, 'volume')
    assert.isArray(plan.pricingTiers)
    assert.lengthOf(plan.pricingTiers!, 3)
  })

  test('should find plan by slug', async ({ assert }) => {
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    await planRepository.create({
      name: 'Pro',
      slug: 'pro',
      description: 'Plan pro',
      price: 49,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'flat',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: null,
      trialDays: null,
      features: null,
      limits: null,
      isActive: true,
      isVisible: true,
      sortOrder: 0,
      stripeProductId: null,
      stripePriceId: null,
    })

    const plan = await planRepository.findBySlug('pro')

    assert.exists(plan)
    assert.equal(plan!.name, 'Pro')
    assert.equal(plan!.slug, 'pro')
  })

  test('should find active and visible plans', async ({ assert }) => {
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    await planRepository.create({
      name: 'Visible Active',
      slug: 'visible-active',
      price: 10,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'flat',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: null,
      isActive: true,
      isVisible: true,
      sortOrder: 1,
      description: null,
      trialDays: null,
      features: null,
      limits: null,
      stripeProductId: null,
      stripePriceId: null,
    })

    await planRepository.create({
      name: 'Hidden Active',
      slug: 'hidden-active',
      price: 20,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'flat',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: null,
      isActive: true,
      isVisible: false,
      sortOrder: 2,
      description: null,
      trialDays: null,
      features: null,
      limits: null,
      stripeProductId: null,
      stripePriceId: null,
    })

    await planRepository.create({
      name: 'Visible Inactive',
      slug: 'visible-inactive',
      price: 30,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'flat',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: null,
      isActive: false,
      isVisible: true,
      sortOrder: 3,
      description: null,
      trialDays: null,
      features: null,
      limits: null,
      stripeProductId: null,
      stripePriceId: null,
    })

    const plans = await planRepository.findActiveAndVisible()

    assert.equal(plans.length, 1)
    assert.equal(plans[0].name, 'Visible Active')
  })

  test('should update plan', async ({ assert }) => {
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    const plan = await planRepository.create({
      name: 'Original',
      slug: 'original',
      price: 10,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'flat',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: null,
      description: null,
      trialDays: null,
      features: null,
      limits: null,
      isActive: true,
      isVisible: true,
      sortOrder: 0,
      stripeProductId: null,
      stripePriceId: null,
    })

    const updated = await planRepository.update(plan.id, {
      name: 'Updated',
      price: 20,
    })

    assert.equal(updated.name, 'Updated')
    assert.equal(updated.price, 20)
    assert.equal(updated.slug, 'original')
  })

  test('should delete plan', async ({ assert }) => {
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    const plan = await planRepository.create({
      name: 'To Delete',
      slug: 'to-delete',
      price: 10,
      currency: 'EUR',
      interval: 'month',
      pricingModel: 'flat',
      baseUsers: null,
      pricePerUser: null,
      pricingTiers: null,
      description: null,
      trialDays: null,
      features: null,
      limits: null,
      isActive: true,
      isVisible: true,
      sortOrder: 0,
      stripeProductId: null,
      stripePriceId: null,
    })

    await planRepository.delete(plan.id)

    const found = await planRepository.findById(plan.id)
    assert.isNull(found)
  })
})
