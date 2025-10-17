import vine from '@vinejs/vine'

export const updateOrganizationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    email: vine.string().trim().email().normalizeEmail().optional(),
    phone: vine.string().trim().maxLength(20).optional(),
    siret: vine.string().trim().maxLength(14).optional(),
    vatNumber: vine.string().trim().maxLength(20).optional(),
    address: vine.string().trim().maxLength(500).optional(),
    website: vine.string().trim().url().optional(),
    description: vine.string().trim().maxLength(1000).optional(),
  })
)
