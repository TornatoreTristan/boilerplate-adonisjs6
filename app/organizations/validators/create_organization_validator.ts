import vine from '@vinejs/vine'

/**
 * Validator pour la création d'une organisation
 */
export const createOrganizationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    description: vine.string().trim().maxLength(500).optional(),
    website: vine.string().trim().url().optional(),
  })
)
