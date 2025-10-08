import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const SessionController = () => import('#sessions/controllers/session_controller')
const UsersController = () => import('#users/controllers/users_controller')

// Routes du compte utilisateur
router
  .group(() => {
    // Mes informations
    router.get('/profile', async ({ inertia }) => {
      return inertia.render('account/profile')
    })
    router.put('/profile', [UsersController, 'updateProfile'])
    router.delete('/delete', [UsersController, 'deleteAccount'])

    // Mes sessions
    router.get('/sessions', [SessionController, 'page'])
    router.delete('/sessions/:id', [SessionController, 'destroy'])
    router.delete('/sessions/others', [SessionController, 'destroyOthers'])

    // Mes préférences
    router.get('/preferences', async ({ inertia }) => {
      return inertia.render('account/preferences')
    })
  })
  .prefix('/account')
  .use([middleware.auth()])
