import type { HttpContext } from '@adonisjs/core/http'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import type OrganizationRepository from '#organizations/repositories/organization_repository'
import { E } from '#shared/exceptions/index'
import { updateOrganizationValidator } from '#organizations/validators/update_organization_validator'
import { uploadLogoValidator } from '#organizations/validators/upload_logo_validator'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class OrganizationSettingsController {
  async index({ inertia, user, organization }: HttpContext) {
    E.assertUserExists(user)
    E.assertOrganizationExists(organization)

    const orgRepo = getService<OrganizationRepository>(TYPES.OrganizationRepository)

    const userRole = await orgRepo.getUserRole(organization.id, user.id)

    await organization.load('users', (query) => {
      query.pivotColumns(['role', 'joined_at'])
    })

    const members = organization.users.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      avatarUrl: member.avatarUrl,
      role: (member as any).$extras.pivot_role,
      joinedAt: (member as any).$extras.pivot_joined_at,
    }))

    return inertia.render('organizations/settings', {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        website: organization.website,
        logoUrl: organization.logoUrl,
        email: organization.email,
        phone: organization.phone,
        siret: organization.siret,
        vatNumber: organization.vatNumber,
        address: organization.address,
        isActive: organization.isActive,
        createdAt: organization.createdAt.toISO(),
        updatedAt: organization.updatedAt.toISO(),
      },
      userRole,
      members,
    })
  }

  async update({ request, response, user, organization, session }: HttpContext) {
    E.assertUserExists(user)
    E.assertOrganizationExists(organization)

    const data = await request.validateUsing(updateOrganizationValidator)

    const orgRepo = getService<OrganizationRepository>(TYPES.OrganizationRepository)

    await orgRepo.update(
      organization.id,
      {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        siret: data.siret || null,
        vatNumber: data.vatNumber || null,
        address: data.address || null,
        website: data.website || null,
        description: data.description || null,
      },
      {
        cache: { tags: ['organizations', `org_${organization.id}`] },
      }
    )

    session.flash('success', 'Organisation mise à jour avec succès')

    return response.redirect('/organizations/settings')
  }

  async integrations({ inertia }: HttpContext) {
    return inertia.render('organizations/settings-integrations')
  }

  async users({ inertia }: HttpContext) {
    return inertia.render('organizations/settings-users')
  }

  async subscriptions({ inertia }: HttpContext) {
    return inertia.render('organizations/settings-subscriptions')
  }

  async uploadLogo({ request, response, user, organization, session }: HttpContext) {
    E.assertUserExists(user)
    E.assertOrganizationExists(organization)

    const logo = request.file('logo', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!logo) {
      session.flash('error', 'Aucun fichier fourni')
      return response.redirect('/organizations/settings')
    }

    const fileName = `${cuid()}.${logo.extname}`
    const uploadPath = app.makePath('public/uploads/logos')

    await logo.move(uploadPath, {
      name: fileName,
      overwrite: true,
    })

    if (!logo.isValid) {
      session.flash('error', `Erreur lors de l'upload: ${logo.errors.join(', ')}`)
      return response.redirect('/organizations/settings')
    }

    const logoUrl = `/uploads/logos/${fileName}`

    const orgRepo = getService<OrganizationRepository>(TYPES.OrganizationRepository)

    await orgRepo.update(
      organization.id,
      { logoUrl },
      {
        cache: { tags: ['organizations', `org_${organization.id}`] },
      }
    )

    session.flash('success', 'Logo mis à jour avec succès')

    return response.redirect('/organizations/settings')
  }
}
