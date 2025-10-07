import { injectable } from 'inversify'
import { BaseRepository } from '#shared/repositories/base_repository'
import Permission from '#roles/models/permission'

@injectable()
export default class PermissionRepository extends BaseRepository<typeof Permission> {
  protected model = Permission

  async findBySlug(slug: string): Promise<Permission | null> {
    return this.findOneBy({ slug })
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    return this.findOneBy({ resource, action })
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.findBy({ resource })
  }

  async findByAction(action: string): Promise<Permission[]> {
    return this.findBy({ action })
  }
}
