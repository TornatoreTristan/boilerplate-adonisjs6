import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const OrganizationsController = () => import('#organizations/controllers/organizations_controller')
const OrganizationSettingsController = () =>
  import('#organizations/controllers/organization_settings_controller')

// Organization creation route - accessible even without existing organization
router
  .get('/organizations/create', async ({ inertia }) => {
    return inertia.render('organizations/create')
  })
  .use([middleware.auth()])

// Organization form submission
router.post('/organizations', [OrganizationsController, 'store']).use([middleware.auth()])

// Organization settings pages - requires authentication and organization context
router
  .group(() => {
    router.get('/settings', [OrganizationSettingsController, 'index'])
    router.put('/settings', [OrganizationSettingsController, 'update'])
    router.post('/settings/logo', [OrganizationSettingsController, 'uploadLogo'])
    router.get('/settings/integrations', [OrganizationSettingsController, 'integrations'])
    router.get('/settings/users', [OrganizationSettingsController, 'users'])
    router.get('/settings/subscriptions', [OrganizationSettingsController, 'subscriptions'])
  })
  .prefix('/organizations')
  .use([middleware.auth(), middleware.requireOrganization(), middleware.organizationContext()])

// API routes for organization management
router
  .group(() => {
    router.get('/', [OrganizationsController, 'index'])
    router.post('/:id/switch', [OrganizationsController, 'switch'])
  })
  .prefix('/api/organizations')
  .use([middleware.auth()])
