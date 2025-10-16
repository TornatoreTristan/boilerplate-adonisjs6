import vine from '@vinejs/vine'

export const addUserToOrganizationValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    role: vine.enum(['owner', 'admin', 'moderator', 'member']),
  })
)
