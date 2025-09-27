import router from '@adonisjs/core/services/router'

const AuthController = () => import('#auth/controllers/auth_controller')

router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.post('/logout', [AuthController, 'logout'])
    router.get('/me', [AuthController, 'me'])
  })
  .prefix('/auth')
