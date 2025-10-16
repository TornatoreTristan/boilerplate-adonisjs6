import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AdminController = () => import('#admin/controllers/admin_controller')

router
  .group(() => {
    router.get('/admin', [AdminController, 'index'])
    router.get('/admin/users', [AdminController, 'users'])
    router.get('/admin/users/:id', [AdminController, 'userDetail'])
    router.put('/admin/users/:id', [AdminController, 'updateUser'])
    router.get('/admin/mails', [AdminController, 'mails'])
    router.get('/admin/organizations', [AdminController, 'organizations'])
    router.get('/admin/organizations/:id', [AdminController, 'organizationDetail'])
    router.post('/admin/organizations/:id/members', [AdminController, 'addUserToOrganization'])
    router.get('/admin/roles', [AdminController, 'roles'])
    router.get('/admin/roles/:id', [AdminController, 'roleDetail'])
  })
  .use([middleware.auth(), middleware.superAdmin()])
