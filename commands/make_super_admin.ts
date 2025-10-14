import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class MakeSuperAdmin extends BaseCommand {
  static commandName = 'make:super-admin'
  static description = 'Promote a user to super administrator'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email of the user to promote' })
  declare email: string

  async run() {
    const { default: db } = await import('@adonisjs/lucid/services/db')
    const { default: User } = await import('#users/models/user')

    // Find user by email
    const user = await User.query().where('email', this.email).first()

    if (!user) {
      this.logger.error(`User with email "${this.email}" not found`)
      return
    }

    // Check if already super-admin
    const existingRole = await db
      .from('user_roles')
      .where('user_id', user.id)
      .where('role_slug', 'super-admin')
      .first()

    if (existingRole) {
      this.logger.warning(`${user.email} is already a super-admin`)
      return
    }

    // Grant super-admin role
    await db.table('user_roles').insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      role_slug: 'super-admin',
      granted_at: new Date(),
    })

    this.logger.success(`${user.email} is now a super-admin!`)
  }
}