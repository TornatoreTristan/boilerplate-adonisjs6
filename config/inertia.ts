import { defineConfig } from '@adonisjs/inertia'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type OrganizationRepository from '#organizations/repositories/organization_repository'

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
    organizations: async (ctx) => {
      if (!ctx.user) {
        return null
      }

      try {
        const orgRepo = getService<OrganizationRepository>(TYPES.OrganizationRepository)
        const userOrganizations = await orgRepo.findByUserId(ctx.user.id)

        const result = {
          current: ctx.organization
            ? {
                id: ctx.organization.id,
                name: ctx.organization.name,
                slug: ctx.organization.slug,
                logoUrl: ctx.organization.logoUrl,
                role: userOrganizations.find((org) => org.id === ctx.organization.id)?.pivot_role,
              }
            : null,
          list: userOrganizations.map((org) => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            logoUrl: org.logoUrl,
            role: org.pivot_role,
          })),
        }

        return result
      } catch (error) {
        return null
      }
    },
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
