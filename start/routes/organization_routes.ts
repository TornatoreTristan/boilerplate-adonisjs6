import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const OrganizationsController = () => import('#organizations/controllers/organizations_controller')

// Organization creation route - accessible even without existing organization
router
  .get('/organizations/create', async ({ inertia }) => {
    return inertia.render('organizations/create')
  })
  .use([middleware.auth()])

// Organization form submission
router.post('/organizations', [OrganizationsController, 'store']).use([middleware.auth()])

// API routes for organization management
router
  .group(() => {
    router.get('/', [OrganizationsController, 'index'])
    router.post('/:id/switch', [OrganizationsController, 'switch'])
  })
  .prefix('/api/organizations')
  .use([middleware.auth()])
