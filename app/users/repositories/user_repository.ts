import type { CreateUserData, User } from '#shared/types/user'
import UserModel from '#users/models/user'

export default class UserRepository {
  async save(userData: CreateUserData): Promise<User> {
    const user = await UserModel.create(userData)
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findBy('email', email)
    return user
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    const user = await UserModel.findOrFail(userId)
    user.password = hashedPassword
    await user.save()
    return user
  }
}
