import { defineConfig } from '@adonisjs/inertia'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type OrganizationRepository from '#organizations/repositories/organization_repository'
import type LocaleService from '#shared/services/locale_service'
import type AppSettingsService from '#app_settings/services/app_settings_service'

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
    csrfToken: (ctx) => ctx.request.csrfToken,
    i18n: async (ctx) => {
      const localeService = getService<LocaleService>(TYPES.LocaleService)
      const locale = ctx.i18n?.locale || 'fr'
      const messages = await localeService.getMessages(locale)

      return {
        locale,
        messages,
      }
    },
    appSettings: async () => {
      try {
        const appSettingsService = getService<AppSettingsService>(TYPES.AppSettingsService)
        const settings = await appSettingsService.getSettings()

        // Type assertion pour accéder aux getters
        const favicon = settings.favicon as any

        return {
          appName: settings.appName,
          faviconUrl: favicon?.url || null,
        }
      } catch (error) {
        return {
          appName: 'My Application',
          faviconUrl: null,
        }
      }
    },
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
