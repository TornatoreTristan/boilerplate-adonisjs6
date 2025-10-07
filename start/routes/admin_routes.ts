import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AdminController = () => import('#admin/controllers/admin_controller')

router
  .group(() => {
    router.get('/admin', [AdminController, 'index'])
  })
  .use([middleware.auth(), middleware.superAdmin()])
