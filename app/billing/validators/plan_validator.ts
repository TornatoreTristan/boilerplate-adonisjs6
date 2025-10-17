import vine from '@vinejs/vine'

const pricingTierSchema = vine.object({
  minUsers: vine.number().min(1),
  maxUsers: vine.number().min(1).nullable(),
  price: vine.number().min(0).optional(),
  pricePerUser: vine.number().min(0).optional(),
})

export const createPlanValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    slug: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(255)
      .regex(/^[a-z0-9-]+$/),
    description: vine.string().trim().optional(),
    priceMonthly: vine.number().min(0),
    priceYearly: vine.number().min(0),
    currency: vine.string().trim().toUpperCase().minLength(3).maxLength(3),
    pricingModel: vine.enum(['flat', 'per_seat', 'tiered', 'volume']),
    pricingTiers: vine.array(pricingTierSchema).optional(),
    trialDays: vine.number().min(0).optional(),
    features: vine.array(vine.string()).optional(),
    limits: vine.record(vine.any()).optional(),
    isActive: vine.boolean().optional(),
    isVisible: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
    syncWithStripe: vine.boolean().optional(),
  })
)

export const updatePlanValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().optional(),
    priceMonthly: vine.number().min(0).optional(),
    priceYearly: vine.number().min(0).optional(),
    currency: vine.string().trim().toUpperCase().minLength(3).maxLength(3).optional(),
    pricingModel: vine.enum(['flat', 'per_seat', 'tiered', 'volume']).optional(),
    pricingTiers: vine.array(pricingTierSchema).optional(),
    trialDays: vine.number().min(0).optional(),
    features: vine.array(vine.string()).optional(),
    limits: vine.record(vine.any()).optional(),
    isActive: vine.boolean().optional(),
    isVisible: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
  })
)
