import { injectable } from 'inversify'
import { BaseRepository } from '#shared/repositories/base_repository'
import Role from '#roles/models/role'

@injectable()
export default class RoleRepository extends BaseRepository<typeof Role> {
  protected model = Role

  async findBySlug(slug: string): Promise<Role | null> {
    return this.findOneBy({ slug })
  }

  async findByName(name: string): Promise<Role | null> {
    return this.findOneBy({ name })
  }

  async findSystemRoles(): Promise<Role[]> {
    return this.findBy({ isSystem: true })
  }

  async findNonSystemRoles(): Promise<Role[]> {
    return this.findBy({ isSystem: false })
  }

  async attachPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.findByIdOrFail(roleId)
    await role.related('permissions').attach(permissionIds)
  }

  async detachPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.findByIdOrFail(roleId)
    await role.related('permissions').detach(permissionIds)
  }

  async syncPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.findByIdOrFail(roleId)
    await role.related('permissions').sync(permissionIds)
  }

  async getPermissions(roleId: string) {
    const role = await this.findByIdOrFail(roleId)
    await role.load('permissions')
    return role.permissions
  }
}
