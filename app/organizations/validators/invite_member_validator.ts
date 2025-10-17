import vine from '@vinejs/vine'

export const inviteMemberValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
    role: vine.enum(['owner', 'admin', 'member']),
  })
)
