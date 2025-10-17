import vine from '@vinejs/vine'

export const removeMemberValidator = vine.compile(
  vine.object({
    userId: vine.string().trim().uuid(),
  })
)
