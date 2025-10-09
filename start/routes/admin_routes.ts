import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AdminController = () => import('#admin/controllers/admin_controller')

router
  .group(() => {
    router.get('/admin', [AdminController, 'index'])
    router.get('/admin/users', [AdminController, 'users'])
    router.get('/admin/users/:id', [AdminController, 'userDetail'])
    router.put('/admin/users/:id', [AdminController, 'updateUser'])
  })
  .use([middleware.auth(), middleware.superAdmin()])
