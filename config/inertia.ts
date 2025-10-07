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
            isEmailVerified: ctx.user.isEmailVerified,
            isSuperAdmin: await ctx.user.isSuperAdmin(),
          }
        : null,
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
