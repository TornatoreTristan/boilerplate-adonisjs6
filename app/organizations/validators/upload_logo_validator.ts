import vine from '@vinejs/vine'

export const uploadLogoValidator = vine.compile(
  vine.object({
    logo: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp'],
      })
      .optional(),
  })
)
