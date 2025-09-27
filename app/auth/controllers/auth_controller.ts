import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#auth/services/auth_service'
import type { LoginData } from '#shared/types/auth'
import User from '#users/models/user'

export default class AuthController {
  async login({ request, response, session }: HttpContext) {
    // Récupérer les données du POST
    const loginData: LoginData = request.only(['email', 'password', 'remember'])

    // Utiliser AuthService pour vérifier les credentials
    const result = await AuthService.login(loginData)

    if (!result.success) {
      return response.status(401).json({
        success: false,
        error: result.error,
      })
    }

    // Créer la session utilisateur
    session.put('user_id', result.user!.id)

    return response.json({
      success: true,
      user: {
        id: result.user!.id,
        email: result.user!.email,
      },
    })
  }

  async logout({ response, session }: HttpContext) {
    session.forget('user_id')

    return response.json({
      success: true,
      message: 'Déconnecté avec succès',
    })
  }

  async me({ response, session }: HttpContext) {
    const userId = session.get('user_id')

    if (!userId) {
      return response.status(401).json({
        success: false,
        error: 'Non authentifié',
      })
    }

    // Récupérer l'utilisateur depuis la session
    const user = await User.find(userId)

    if (!user) {
      return response.status(401).json({
        success: false,
        error: 'Utilisateur introuvable',
      })
    }

    return response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  }
}
