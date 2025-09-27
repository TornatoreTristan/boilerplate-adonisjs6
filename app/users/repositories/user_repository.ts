import type { CreateUserData, User } from '#shared/types/user'
import UserModel from '#users/models/user'

export default class UserRepository {
  async save(userData: CreateUserData): Promise<User> {
    const user = await UserModel.create(userData)
    return user
  }
}
