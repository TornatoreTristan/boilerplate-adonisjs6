import { test } from '@japa/runner'
import AuditLogService from '#audit/services/audit_log_service'
import AuditLogRepository from '#audit/repositories/audit_log_repository'
import { AuditAction } from '#audit/types/audit'
import User from '#users/models/user'
import Organization from '#organizations/models/organization'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('AuditLogService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let user: User
  let organization: Organization

  group.each.setup(async () => {
    user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    })

    organization = await Organization.create({
      name: 'Test Org',
      slug: 'test-org',
    })
  })

  test('should create an audit log entry', async ({ assert }) => {
    const repository = new AuditLogRepository()
    const service = new AuditLogService(repository)

    const logData = {
      userId: user.id,
      organizationId: organization.id,
      action: AuditAction.USER_CREATED,
      resourceType: 'User',
      resourceId: user.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      metadata: {
        email: 'test@example.com',
      },
    }

    const result = await service.log(logData)

    assert.isObject(result)
    assert.equal(result.userId, logData.userId)
    assert.equal(result.action, logData.action)
    assert.equal(result.resourceType, logData.resourceType)
  })

  test('should get user logs', async ({ assert }) => {
    const repository = new AuditLogRepository()
    const service = new AuditLogService(repository)

    await service.log({
      userId: user.id,
      action: AuditAction.LOGIN_SUCCESS,
      ipAddress: '127.0.0.1',
    })

    await service.log({
      userId: user.id,
      action: AuditAction.USER_UPDATED,
      resourceType: 'User',
      resourceId: user.id,
    })

    const results = await service.getUserLogs(user.id)

    assert.isArray(results)
    assert.lengthOf(results, 2)
  })

  test('should get organization logs', async ({ assert }) => {
    const repository = new AuditLogRepository()
    const service = new AuditLogService(repository)

    await service.log({
      userId: user.id,
      organizationId: organization.id,
      action: AuditAction.ORGANIZATION_UPDATED,
      resourceType: 'Organization',
      resourceId: organization.id,
    })

    const results = await service.getOrganizationLogs(organization.id)

    assert.isArray(results)
    assert.lengthOf(results, 1)
    assert.equal(results[0].organizationId, organization.id)
  })

  test('should get resource logs', async ({ assert }) => {
    const repository = new AuditLogRepository()
    const service = new AuditLogService(repository)

    await service.log({
      userId: user.id,
      action: AuditAction.USER_UPDATED,
      resourceType: 'User',
      resourceId: user.id,
    })

    const results = await service.getResourceLogs('User', user.id)

    assert.isArray(results)
    assert.lengthOf(results, 1)
    assert.equal(results[0].resourceType, 'User')
    assert.equal(results[0].resourceId, user.id)
  })

  test('should search audit logs', async ({ assert }) => {
    const repository = new AuditLogRepository()
    const service = new AuditLogService(repository)

    await service.log({
      userId: user.id,
      action: 'user.profile.updated',
      resourceType: 'User',
      resourceId: user.id,
    })

    const results = await service.search('user profile')

    assert.isArray(results)
  })

  test('should get audit log statistics', async ({ assert }) => {
    const repository = new AuditLogRepository()
    const service = new AuditLogService(repository)

    await service.log({ userId: user.id, action: AuditAction.LOGIN_SUCCESS })
    await service.log({ userId: user.id, action: AuditAction.LOGIN_SUCCESS })
    await service.log({ userId: user.id, action: AuditAction.LOGOUT })

    const stats = await service.getStatistics()

    assert.isObject(stats)
    assert.equal(stats.totalLogs, 3)
    assert.equal(stats.uniqueUsers, 1)
    assert.isArray(stats.topActions)
  })

  test('should find logs with filters', async ({ assert }) => {
    const repository = new AuditLogRepository()
    const service = new AuditLogService(repository)

    await service.log({
      userId: user.id,
      organizationId: organization.id,
      action: AuditAction.USER_CREATED,
    })

    await service.log({
      userId: user.id,
      organizationId: organization.id,
      action: AuditAction.ORGANIZATION_UPDATED,
    })

    const result = await service.findWithFilters({
      organizationId: organization.id,
      limit: 10,
      offset: 0,
    })

    assert.isObject(result)
    assert.isArray(result.data)
    assert.lengthOf(result.data, 2)
    assert.equal(result.total, 2)
  })

  test('should get recent logs', async ({ assert }) => {
    const repository = new AuditLogRepository()
    const service = new AuditLogService(repository)

    await service.log({ userId: user.id, action: AuditAction.LOGIN_SUCCESS })
    await service.log({ userId: user.id, action: AuditAction.LOGOUT })

    const results = await service.getRecent(7, 50)

    assert.isArray(results)
    assert.lengthOf(results, 2)
  })
})
