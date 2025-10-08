import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    auth: async (ctx) => ({
      user: ctx.user
        ? {
            id: ctx.user.id,
            fullName: ctx.user.fullName,
            email: ctx.user.email,
            avatarUrl: ctx.user.avatarUrl,
            googleId: ctx.user.googleId,
            isEmailVerified: ctx.user.isEmailVerified,
            isSuperAdmin: await ctx.user.isSuperAdmin(),
          }
        : null,
    }),
    flash: (ctx) => ({
      success: ctx.session.flashMessages.get('success'),
      error: ctx.session.flashMessages.get('error'),
      info: ctx.session.flashMessages.get('info'),
      warning: ctx.session.flashMessages.get('warning'),
    }),
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig
