import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#auth/services/auth_service'
import type { LoginData } from '#shared/types/auth'
import User from '#users/models/user'
import SessionService from '#sessions/services/session_service'

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

    // Extraire les données UTM et referrer
    const utmSource = request.input('utm_source')
    const utmMedium = request.input('utm_medium')
    const utmCampaign = request.input('utm_campaign')
    const referrer = request.header('referer')

    // Créer l'entrée de session dans la base
    const userSession = await SessionService.createSession({
      userId: result.user!.id,
      ipAddress: request.ip(),
      userAgent: request.header('user-agent') || 'Unknown',
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    })

    // Stocker l'ID de session pour pouvoir la fermer au logout
    session.put('session_id', userSession.id)

    return response.json({
      success: true,
      user: {
        id: result.user!.id,
        email: result.user!.email,
      },
    })
  }

  async logout({ response, session }: HttpContext) {
    const sessionId = session.get('session_id')

    if (sessionId) {
      await SessionService.endSession(sessionId)
    }

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
