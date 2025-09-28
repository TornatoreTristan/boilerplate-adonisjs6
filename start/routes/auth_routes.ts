import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#auth/controllers/auth_controller')
const PasswordResetController = () => import('#auth/controllers/password_reset_controller')

// Routes publiques (pas de middleware auth)
router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.post('/logout', [AuthController, 'logout'])
  })
  .prefix('/auth')

// Routes protégées (sans middleware - vous pouvez l'ajouter plus tard)
router
  .group(() => {
    router.get('/me', [AuthController, 'me'])
  })
  .prefix('/auth')
  .use(middleware.auth())

// Routes de réinitialisation de mot de passe
router
  .group(() => {
    router.post('/forgot', [PasswordResetController, 'forgot'])
    router.get('/reset/:token', [PasswordResetController, 'validateToken'])
    router.post('/reset', [PasswordResetController, 'reset'])
  })
  .prefix('/password')
