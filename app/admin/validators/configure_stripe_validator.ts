import vine from '@vinejs/vine'

export const configureStripeValidator = vine.compile(
  vine.object({
    publicKey: vine.string().trim().minLength(1),
    secretKey: vine.string().trim().optional(),
    webhookSecret: vine.string().trim().optional(),
    isActive: vine.boolean(),
  })
)
