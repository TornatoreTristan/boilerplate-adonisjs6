// app/auth/services/auth_service.ts
import { LoginData, LoginResult, RegisterData, RegisterResult } from '#shared/types/auth'
import User from '#users/models/user'
import hash from '@adonisjs/core/services/hash'
import { ValidationException } from '#shared/exceptions/validation_exception'
import { AUTH_MESSAGES } from '#auth/constants/auth_messages'

export default class AuthService {
  static async login(loginData: LoginData): Promise<LoginResult> {
    try {
      // Validation des données d'entrée
      this.validateLoginData(loginData)

      // Recherche de l'utilisateur
      const user = await this.findUserByEmail(loginData.email)
      if (!user) {
        return this.createFailureResult(AUTH_MESSAGES.INVALID_CREDENTIALS)
      }

      // Vérification du mot de passe
      const isValidPassword = await this.verifyPassword(user.password, loginData.password)
      if (!isValidPassword) {
        return this.createFailureResult(AUTH_MESSAGES.INVALID_CREDENTIALS)
      }

      return this.createSuccessResult(user)
    } catch (error) {
      if (error instanceof ValidationException) {
        return this.createFailureResult(error.message)
      }
      throw error
    }
  }

  private static validateLoginData(loginData: LoginData): void {
    if (!loginData.email?.trim()) {
      throw new ValidationException(AUTH_MESSAGES.EMAIL_REQUIRED)
    }

    if (!loginData.password?.trim()) {
      throw new ValidationException(AUTH_MESSAGES.PASSWORD_REQUIRED)
    }

    if (!this.isValidEmail(loginData.email)) {
      throw new ValidationException(AUTH_MESSAGES.INVALID_EMAIL_FORMAT)
    }
  }

  private static async findUserByEmail(email: string): Promise<User | null> {
    return await User.findBy('email', email.toLowerCase().trim())
  }

  private static async verifyPassword(
    hashedPassword: string,
    plainPassword: string
  ): Promise<boolean> {
    return await hash.verify(hashedPassword, plainPassword)
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static createSuccessResult(user: User): LoginResult {
    return {
      success: true,
      user: user,
      error: undefined,
    }
  }

  private static createFailureResult(errorMessage: string): LoginResult {
    return {
      success: false,
      user: null,
      error: errorMessage,
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(registerData: RegisterData): Promise<RegisterResult> {
    try {
      // Validation des données d'entrée
      this.validateRegisterData(registerData)

      // Vérifier si l'email existe déjà
      const existingUser = await this.findUserByEmail(registerData.email)
      if (existingUser) {
        return this.createRegisterFailureResult('Cet email est déjà utilisé')
      }

      // Vérifier que les mots de passe correspondent
      if (registerData.password !== registerData.confirmPassword) {
        return this.createRegisterFailureResult('Les mots de passe ne correspondent pas')
      }

      // Hash du mot de passe
      const hashedPassword = await hash.make(registerData.password)

      // Créer l'utilisateur
      const user = await User.create({
        email: registerData.email.toLowerCase().trim(),
        password: hashedPassword,
        fullName: registerData.fullName || null,
      })

      return this.createRegisterSuccessResult(user)
    } catch (error) {
      if (error instanceof ValidationException) {
        return this.createRegisterFailureResult(error.message)
      }
      throw error
    }
  }

  private static validateRegisterData(registerData: RegisterData): void {
    if (!registerData.email?.trim()) {
      throw new ValidationException('Email requis')
    }

    if (!registerData.password?.trim()) {
      throw new ValidationException('Mot de passe requis')
    }

    if (!registerData.confirmPassword?.trim()) {
      throw new ValidationException('Confirmation du mot de passe requise')
    }

    if (!this.isValidEmail(registerData.email)) {
      throw new ValidationException('Format d\'email invalide')
    }

    if (registerData.password.length < 8) {
      throw new ValidationException('Le mot de passe doit contenir au moins 8 caractères')
    }
  }

  private static createRegisterSuccessResult(user: User): RegisterResult {
    return {
      success: true,
      user: user,
      error: undefined,
    }
  }

  private static createRegisterFailureResult(errorMessage: string): RegisterResult {
    return {
      success: false,
      user: null,
      error: errorMessage,
    }
  }
}
