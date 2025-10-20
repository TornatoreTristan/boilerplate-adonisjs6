import { test } from '@japa/runner'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type PlanService from '#billing/services/plan_service'
import type PlanRepository from '#billing/repositories/plan_repository'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('PlanService - Features & Limits', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should store features and limits when creating a plan', async ({ assert }) => {
    // Arrange
    const planService = getService<PlanService>(TYPES.PlanService)
    const planRepository = getService<PlanRepository>(TYPES.PlanRepository)

    const planData = {
      name: 'Pro Plan',
      slug: 'pro',
      description: 'Plan professionnel',
      priceMonthly: 29,
      priceYearly: 290,
      currency: 'EUR',
      pricingModel: 'flat' as const,
      features: ['10 utilisateurs', 'Support prioritaire', 'API access'],
      limits: {
        maxUsers: 10,
        maxProjects: 50,
        storageGB: 100,
      },
      syncWithStripe: false, // On teste juste la DB pour l'instant
    }

    // Act
    const plan = await planService.createPlan(planData)

    // Assert
    assert.exists(plan.id)
    assert.equal(plan.name, 'Pro Plan')
    assert.equal(plan.slug, 'pro')
    assert.isArray(plan.features)
    assert.lengthOf(plan.features!, 3)
    assert.include(plan.features!, '10 utilisateurs')
    assert.include(plan.features!, 'Support prioritaire')
    assert.include(plan.features!, 'API access')

    assert.isObject(plan.limits)
    assert.equal(plan.limits!.maxUsers, 10)
    assert.equal(plan.limits!.maxProjects, 50)
    assert.equal(plan.limits!.storageGB, 100)

    // Verify persistence
    const retrievedPlan = await planRepository.findById(plan.id)
    assert.exists(retrievedPlan)
    assert.deepEqual(retrievedPlan!.features, planData.features)
    assert.deepEqual(retrievedPlan!.limits, planData.limits)
  })

  test('should update features and limits when updating a plan', async ({ assert }) => {
    // Arrange
    const planService = getService<PlanService>(TYPES.PlanService)

    const plan = await planService.createPlan({
      name: 'Starter Plan',
      slug: 'starter',
      priceMonthly: 9,
      priceYearly: 90,
      currency: 'EUR',
      pricingModel: 'flat' as const,
      features: ['5 utilisateurs'],
      limits: { maxUsers: 5 },
      syncWithStripe: false,
    })

    // Act
    const updatedPlan = await planService.updatePlan(plan.id, {
      features: ['10 utilisateurs', 'Email support'],
      limits: { maxUsers: 10, maxStorage: 50 },
    })

    // Assert
    assert.lengthOf(updatedPlan.features!, 2)
    assert.include(updatedPlan.features!, '10 utilisateurs')
    assert.include(updatedPlan.features!, 'Email support')
    assert.equal(updatedPlan.limits!.maxUsers, 10)
    assert.equal(updatedPlan.limits!.maxStorage, 50)
  })

  test('should handle plans without features or limits', async ({ assert }) => {
    // Arrange
    const planService = getService<PlanService>(TYPES.PlanService)

    // Act
    const plan = await planService.createPlan({
      name: 'Free Plan',
      slug: 'free',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'EUR',
      pricingModel: 'flat' as const,
      syncWithStripe: false,
    })

    // Assert
    assert.exists(plan.id)
    assert.isNull(plan.features)
    assert.isNull(plan.limits)
  })
})
