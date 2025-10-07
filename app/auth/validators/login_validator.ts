import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail().trim(),
    password: vine.string().minLength(1),
    remember: vine.boolean().optional(),
  })
)
