import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('HealthController', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /health - should return liveness status', async ({ client, assert }) => {
    // Act
    const response = await client.get('/health')

    // Assert
    response.assertStatus(200)
    assert.properties(response.body(), ['status', 'timestamp', 'uptime'])
    assert.equal(response.body().status, 'ok')
    assert.isString(response.body().timestamp)
    assert.isNumber(response.body().uptime)
  })

  test('GET /health/ready - should return readiness status with checks', async ({
    client,
    assert,
  }) => {
    // Act
    const response = await client.get('/health/ready')

    // Assert
    response.assertStatus(200)
    assert.properties(response.body(), ['status', 'timestamp', 'uptime', 'checks'])
    assert.include(['ok', 'degraded', 'down'], response.body().status)
    assert.isString(response.body().timestamp)
    assert.isNumber(response.body().uptime)

    // Vérifier que les checks existent
    assert.properties(response.body().checks, ['database', 'redis'])

    // Vérifier le format des checks
    const dbCheck = response.body().checks.database
    assert.properties(dbCheck, ['status'])
    assert.include(['ok', 'degraded', 'down'], dbCheck.status)

    const redisCheck = response.body().checks.redis
    assert.properties(redisCheck, ['status'])
    assert.include(['ok', 'degraded', 'down'], redisCheck.status)
  })

  test('GET /health/ready - should include latency in checks', async ({ client, assert }) => {
    // Act
    const response = await client.get('/health/ready')

    // Assert
    response.assertStatus(200)

    // Si les checks sont OK, ils devraient avoir une latence
    const dbCheck = response.body().checks.database
    if (dbCheck.status === 'ok' || dbCheck.status === 'degraded') {
      assert.isNumber(dbCheck.latency)
      assert.isAtLeast(dbCheck.latency, 0)
    }

    const redisCheck = response.body().checks.redis
    if (redisCheck.status === 'ok' || redisCheck.status === 'degraded') {
      assert.isNumber(redisCheck.latency)
      assert.isAtLeast(redisCheck.latency, 0)
    }
  })

  test('GET /health/ready - should include details in checks', async ({ client, assert }) => {
    // Act
    const response = await client.get('/health/ready')

    // Assert
    response.assertStatus(200)

    // Vérifier que les détails sont présents pour les checks OK
    const dbCheck = response.body().checks.database
    if (dbCheck.status === 'ok' || dbCheck.status === 'degraded') {
      assert.isDefined(dbCheck.details)
    }

    const redisCheck = response.body().checks.redis
    if (redisCheck.status === 'ok' || redisCheck.status === 'degraded') {
      assert.isDefined(redisCheck.details)
    }
  })

  test('GET /health - should be fast (liveness)', async ({ client, assert }) => {
    // Act
    const start = performance.now()
    const response = await client.get('/health')
    const duration = performance.now() - start

    // Assert
    response.assertStatus(200)
    assert.isBelow(duration, 100) // Devrait répondre en moins de 100ms
  })

  test('GET /health/ready - should complete within reasonable time', async ({
    client,
    assert,
  }) => {
    // Act
    const start = performance.now()
    const response = await client.get('/health/ready')
    const duration = performance.now() - start

    // Assert
    response.assertStatus(200)
    assert.isBelow(duration, 1000) // Devrait répondre en moins de 1 seconde
  })
})
