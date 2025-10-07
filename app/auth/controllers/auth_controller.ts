import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#auth/services/auth_service'
import type { LoginData, RegisterData } from '#shared/types/auth'
import SessionService from '#sessions/services/session_service'
import { E } from '#shared/exceptions/index'
import { registerValidator } from '#auth/validators/register_validator'
import { loginValidator } from '#auth/validators/login_validator'
import { getService } from '#shared/container/container'
import { TYPES } from '#shared/container/types'
import EmailVerificationService from '#auth/services/email_verification_service'

export default class AuthController {
  async login({ request, response, session }: HttpContext) {
    // Valider les données avec Vine
    const loginData = await request.validateUsing(loginValidator)

    // Utiliser AuthService pour vérifier les credentials
    const result = await AuthService.login(loginData as LoginData)

    // Si l'authentification échoue, rediriger avec erreur
    if (!result.success) {
      session.flashErrors({ email: result.error })
      return response.redirect().back()
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

    // Stocker l'ID de session pour pouvoir la ferme au logout
    session.put('session_id', userSession.id)

    // Rediriger vers la page d'accueil
    return response.redirect('/')
  }

  async logout({ response, session }: HttpContext) {
    const sessionId = session.get('session_id')

    if (sessionId) {
      await SessionService.endSession(sessionId)
    }

    session.forget('user_id')
    session.forget('session_id')

    // Rediriger vers la page de login
    return response.redirect('/login')
  }

  async me({ response, user }: HttpContext) {
    // L'utilisateur est maintenant automatiquement chargé par le middleware auth
    // Si on arrive ici, c'est qu'il est authentifié
    E.assertUserExists(user)

    return response.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
      },
    })
  }

  async register({ request, response, session }: HttpContext) {
    // Valider les données avec Vine
    const registerData = await request.validateUsing(registerValidator)

    // Utiliser AuthService pour créer l'utilisateur
    const result = await AuthService.register(registerData as RegisterData)

    // Si l'inscription échoue, rediriger avec erreur
    if (!result.success) {
      session.flashErrors({ email: result.error })
      return response.redirect().back()
    }

    // Créer la session utilisateur automatiquement après inscription
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

    // Stocker l'ID de session
    session.put('session_id', userSession.id)

    // Envoyer l'email de vérification
    try {
      const emailVerificationService = getService<EmailVerificationService>(
        TYPES.EmailVerificationService
      )
      await emailVerificationService.sendVerificationEmail(result.user!.id)
    } catch (error) {
      // Log l'erreur mais ne bloque pas l'inscription
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error)
    }

    // Rediriger vers la page de confirmation
    return response.redirect('/auth/verify-email-notice')
  }
}
