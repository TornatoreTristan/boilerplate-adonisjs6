import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import UserService from '#users/services/user_service'
import type { CreateUserData } from '#shared/types/user'

test.group('AuthController - Login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('should login via HTTP and create session', async ({ client }) => {
    // Arrange - Créer un utilisateur
    const userData: CreateUserData = {
      email: 'user@example.com',
      password: 'password123',
    }
    await UserService.create(userData)

    // Act - POST /login
    const response = await client.post('/auth/login').json({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: false,
    })

    // Assert
    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    // TODO: vérifier que la session contient user_id
  })

  test('should logout and clear session', async ({ client }) => {
    // Arrange - Créer un utilisateur et se connecter
    const userData: CreateUserData = {
      email: 'user@example.com',
      password: 'password123',
    }
    await UserService.create(userData)

    // Se connecter
    const loginResponse = await client.post('/auth/login').json({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: false,
    })

    loginResponse.assertStatus(200)

    // Act - Se déconnecter
    const logoutResponse = await client.post('/auth/logout')

    // Assert - Vérifier la réponse de déconnexion
    logoutResponse.assertStatus(200)
    logoutResponse.assertBodyContains({
      success: true,
      message: 'Déconnecté avec succès',
    })

    // Vérification avancée - Tenter d'accéder à une route protégée
    // Cette route devrait échouer car la session a été supprimée
    const protectedResponse = await client.get('/auth/me') // Route qui nécessite d'être connecté

    protectedResponse.assertStatus(401) // Non autorisé car plus de session
  })
})
