import vine from '@vinejs/vine'

export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(1).optional(),
    email: vine.string().trim().email().normalizeEmail(),
  })
)
