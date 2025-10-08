import vine from '@vinejs/vine'

/**
 * Validator pour la mise à jour du profil utilisateur
 */
export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(255),
  })
)
