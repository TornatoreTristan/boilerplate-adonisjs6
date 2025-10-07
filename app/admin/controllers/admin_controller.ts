import type { HttpContext } from '@adonisjs/core/http'
import User from '#users/models/user'

export default class AdminController {
  async index({ inertia, session }: HttpContext) {
    const userId = session.get('user_id')
    const user = await User.findOrFail(userId)

    return inertia.render('admin/index', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    })
  }
}
