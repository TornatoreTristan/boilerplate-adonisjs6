import type { HttpContext } from '@adonisjs/core/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type UserRepository from '#users/repositories/user_repository'
import type AdminService from '#admin/services/admin_service'
import type StripeConnectService from '#integrations/services/stripe_connect_service'
import { updateUserValidator } from '#admin/validators/update_user_validator'
import { addUserToOrganizationValidator } from '#admin/validators/add_user_to_organization_validator'
import { configureStripeValidator } from '#admin/validators/configure_stripe_validator'
import { randomBytes } from 'node:crypto'

export default class AdminController {
  async index({ inertia, session }: HttpContext) {
    const userId = session.get('user_id')
    const userRepository = getService<UserRepository>(TYPES.UserRepository)
    const adminService = getService<AdminService>(TYPES.AdminService)

    const user = await userRepository.findById(userId)
    const stats = await adminService.getDashboardStats(30)

    return inertia.render('admin/index', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      stats,
    })
  }

  async users({ inertia }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)

    const usersWithActivity = await adminService.getUsersWithLastActivity()

    const formattedUsers = usersWithActivity.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      googleId: user.googleId,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastActivity: user.lastActivity?.toISO() || null,
    }))

    return inertia.render('admin/users', {
      users: formattedUsers,
    })
  }

  async userDetail({ params, inertia }: HttpContext) {
    const userRepository = getService<UserRepository>(TYPES.UserRepository)
    const adminService = getService<AdminService>(TYPES.AdminService)

    const user = await userRepository.findById(params.id)
    const sessions = await adminService.getUserSessions(params.id)

    return inertia.render('admin/user-detail', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        googleId: user.googleId,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISO(),
        updatedAt: user.updatedAt.toISO(),
      },
      sessions: sessions.map((session) => ({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        startedAt: session.startedAt.toISO(),
        lastActivity: session.lastActivity.toISO(),
        endedAt: session.endedAt?.toISO() || null,
        isActive: session.isActive,
        country: session.country,
        city: session.city,
        deviceType: session.deviceType,
        os: session.os,
        browser: session.browser,
      })),
    })
  }

  async updateUser({ params, request, response, session }: HttpContext) {
    const userRepository = getService<UserRepository>(TYPES.UserRepository)
    const data = await request.validateUsing(updateUserValidator)

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existingUser = await userRepository.findOneBy({ email: data.email })
    if (existingUser && existingUser.id !== params.id) {
      return response.status(422).json({
        errors: {
          email: 'Cet email est déjà utilisé par un autre utilisateur',
        },
      })
    }

    const user = await userRepository.update(params.id, data)

    session.flash('success', 'Utilisateur mis à jour avec succès')
    return response.redirect().back()
  }

  async mails({ inertia, request }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)

    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const status = request.input('status')
    const category = request.input('category')
    const search = request.input('search')

    const [logs, stats] = await Promise.all([
      adminService.getEmailLogs({ page, perPage, status, category, search }),
      adminService.getEmailLogsStats(),
    ])

    return inertia.render('admin/mails', {
      logs,
      stats,
      filters: { status, category, search },
    })
  }

  async organizations({ inertia }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)

    const organizations = await adminService.getOrganizations()

    return inertia.render('admin/organizations', {
      organizations,
    })
  }

  async organizationDetail({ params, inertia }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)

    const detail = await adminService.getOrganizationDetail(params.id)

    return inertia.render('admin/organization-detail', {
      organization: detail.organization,
      members: detail.members,
    })
  }

  async addUserToOrganization({ params, request, response, session }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)

    const data = await request.validateUsing(addUserToOrganizationValidator)

    try {
      await adminService.addUserToOrganization(params.id, data.email, data.role)
      session.flash('success', 'Utilisateur ajouté à l\'organisation avec succès')
    } catch (error) {
      session.flashErrors({ email: error.message })
    }

    return response.redirect().back()
  }

  async roles({ inertia }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)

    const roles = await adminService.getRoles()

    return inertia.render('admin/roles', {
      roles,
    })
  }

  async roleDetail({ params, inertia }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)

    const detail = await adminService.getRoleDetail(params.id)

    return inertia.render('admin/role-detail', {
      role: detail.role,
      permissions: detail.permissions,
    })
  }

  async integrations({ inertia }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)
    const stripeIntegration = await adminService.getIntegration('stripe')

    return inertia.render('admin/integrations', {
      stripe: stripeIntegration
        ? {
            isActive: stripeIntegration.isActive,
            publicKey: stripeIntegration.config.publicKey || '',
            hasSecretKey: !!stripeIntegration.config.secretKey,
            hasWebhookSecret: !!stripeIntegration.config.webhookSecret,
          }
        : null,
    })
  }

  async configureStripe({ request, response, session }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)
    const data = await request.validateUsing(configureStripeValidator)

    const existingIntegration = await adminService.getIntegration('stripe')

    const config: Record<string, any> = {
      publicKey: data.publicKey,
      secretKey: data.secretKey || existingIntegration?.config.secretKey || '',
      webhookSecret: data.webhookSecret || existingIntegration?.config.webhookSecret || '',
    }

    await adminService.configureIntegration('stripe', config, data.isActive)

    session.flash('success', 'Configuration Stripe mise à jour avec succès')
    return response.redirect().back()
  }

  async stripeConnectAuthorize({ response, session }: HttpContext) {
    const stripeConnectService = getService<StripeConnectService>(TYPES.StripeConnectService)

    const state = randomBytes(32).toString('hex')
    session.put('stripe_oauth_state', state)

    const authUrl = stripeConnectService.getAuthorizationUrl(state)
    return response.redirect(authUrl)
  }

  async stripeConnectCallback({ request, response, session }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)
    const stripeConnectService = getService<StripeConnectService>(TYPES.StripeConnectService)

    const { code, state, error } = request.qs()

    if (error) {
      session.flash('error', `Erreur Stripe: ${error}`)
      return response.redirect('/admin/integrations')
    }

    const savedState = session.get('stripe_oauth_state')
    if (!savedState || savedState !== state) {
      session.flash('error', 'État de sécurité invalide')
      return response.redirect('/admin/integrations')
    }

    session.forget('stripe_oauth_state')

    try {
      const tokens = await stripeConnectService.exchangeCodeForToken(code)

      await adminService.configureIntegration('stripe', {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        publicKey: tokens.stripe_publishable_key,
        stripeUserId: tokens.stripe_user_id,
        scope: tokens.scope,
      }, true)

      session.flash('success', 'Compte Stripe connecté avec succès !')
    } catch (err) {
      session.flash('error', `Erreur lors de la connexion: ${err.message}`)
    }

    return response.redirect('/admin/integrations')
  }

  async stripeDisconnect({ response, session }: HttpContext) {
    const adminService = getService<AdminService>(TYPES.AdminService)
    const stripeConnectService = getService<StripeConnectService>(TYPES.StripeConnectService)

    try {
      const integration = await adminService.getIntegration('stripe')

      if (integration?.config.stripeUserId) {
        await stripeConnectService.disconnectAccount(integration.config.stripeUserId)
      }

      await adminService.configureIntegration('stripe', {}, false)

      session.flash('success', 'Compte Stripe déconnecté avec succès')
    } catch (err) {
      session.flash('error', `Erreur lors de la déconnexion: ${err.message}`)
    }

    return response.redirect('/admin/integrations')
  }
}
