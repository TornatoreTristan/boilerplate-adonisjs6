import vine from '@vinejs/vine'

export const updateMemberRoleValidator = vine.compile(
  vine.object({
    userId: vine.string().trim().uuid(),
    role: vine.enum(['owner', 'admin', 'member']),
  })
)
