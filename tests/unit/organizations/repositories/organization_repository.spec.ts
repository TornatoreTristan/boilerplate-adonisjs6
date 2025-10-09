import { test } from '@japa/runner'
import OrganizationRepository from '#organizations/repositories/organization_repository'
import Organization from '#organizations/models/organization'
import User from '#users/models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('OrganizationRepository', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let user: User
  let repository: OrganizationRepository

  group.each.setup(async () => {
    user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    repository = new OrganizationRepository()
  })

  test('should count user organizations - zero organizations', async ({ assert }) => {
    const count = await repository.countUserOrganizations(user.id)

    assert.equal(count, 0)
  })

  test('should count user organizations - one organization', async ({ assert }) => {
    const org = await Organization.create({
      name: 'Test Org',
      slug: 'test-org',
    })

    await org.related('users').attach({
      [user.id]: {
        joined_at: new Date(),
      },
    })

    const count = await repository.countUserOrganizations(user.id)

    assert.equal(count, 1)
  })

  test('should count user organizations - multiple organizations', async ({ assert }) => {
    const org1 = await Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })

    const org2 = await Organization.create({
      name: 'Org 2',
      slug: 'org-2',
    })

    const org3 = await Organization.create({
      name: 'Org 3',
      slug: 'org-3',
    })

    await org1.related('users').attach({
      [user.id]: {
        joined_at: new Date(),
      },
    })

    await org2.related('users').attach({
      [user.id]: {
        joined_at: new Date(),
      },
    })

    await org3.related('users').attach({
      [user.id]: {
        joined_at: new Date(),
      },
    })

    const count = await repository.countUserOrganizations(user.id)

    assert.equal(count, 3)
  })

  test('should count only user organizations, not other users', async ({ assert }) => {
    const otherUser = await User.create({
      email: 'other@example.com',
      password: 'password123',
    })

    const org1 = await Organization.create({
      name: 'Org 1',
      slug: 'org-1',
    })

    const org2 = await Organization.create({
      name: 'Org 2',
      slug: 'org-2',
    })

    await org1.related('users').attach({
      [user.id]: {
        joined_at: new Date(),
      },
    })

    await org2.related('users').attach({
      [otherUser.id]: {
        joined_at: new Date(),
      },
    })

    const count = await repository.countUserOrganizations(user.id)

    assert.equal(count, 1)
  })

  test('should find organization by slug', async ({ assert }) => {
    await repository.create({
      name: 'Test Org',
      slug: 'test-org',
      isActive: true,
    })

    const result = await repository.findBySlug('test-org')

    assert.isObject(result)
    assert.equal(result?.slug, 'test-org')
  })

  test('should return null for non-existent slug', async ({ assert }) => {
    const result = await repository.findBySlug('non-existent')

    assert.isNull(result)
  })

  test('should check if slug exists', async ({ assert }) => {
    await repository.create({
      name: 'Test Org',
      slug: 'test-org',
      isActive: true,
    })

    const exists = await repository.slugExists('test-org')
    const notExists = await repository.slugExists('non-existent')

    assert.isTrue(exists)
    assert.isFalse(notExists)
  })

  test('should find organization with members', async ({ assert }) => {
    const org = await Organization.create({
      name: 'Test Org',
      slug: 'test-org',
    })

    await org.related('users').attach({
      [user.id]: {
        joined_at: new Date(),
      },
    })

    const result = await repository.findWithMembers(org.id)

    assert.isObject(result)
    assert.exists(result?.users)
    assert.lengthOf(result!.users, 1)
  })

  test('should add user to organization', async ({ assert }) => {
    const org = await Organization.create({
      name: 'Test Org',
      slug: 'test-org',
    })

    await repository.addUser(org.id, user.id, 'member')

    const isMember = await repository.isUserMember(org.id, user.id)

    assert.isTrue(isMember)
  })

  test('should remove user from organization', async ({ assert }) => {
    const org = await Organization.create({
      name: 'Test Org',
      slug: 'test-org',
    })

    await org.related('users').attach({
      [user.id]: {
        joined_at: new Date(),
      },
    })

    assert.isTrue(await repository.isUserMember(org.id, user.id))

    await repository.removeUser(org.id, user.id)

    assert.isFalse(await repository.isUserMember(org.id, user.id))
  })

  test('should get user role in organization', async ({ assert }) => {
    const org = await Organization.create({
      name: 'Test Org',
      slug: 'test-org',
    })

    await org.related('users').attach({
      [user.id]: {
        role: 'owner',
        joined_at: new Date(),
      },
    })

    const role = await repository.getUserRole(org.id, user.id)

    assert.equal(role, 'owner')
  })

  test('should update user role in organization', async ({ assert }) => {
    const org = await Organization.create({
      name: 'Test Org',
      slug: 'test-org',
    })

    await org.related('users').attach({
      [user.id]: {
        role: 'member',
        joined_at: new Date(),
      },
    })

    await repository.updateUserRole(org.id, user.id, 'admin')

    const role = await repository.getUserRole(org.id, user.id)

    assert.equal(role, 'admin')
  })
})
