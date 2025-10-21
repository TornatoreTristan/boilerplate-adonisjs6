import router from '@adonisjs/core/services/router'

const HealthController = () => import('#health/controllers/health_controller')

router.get('/health', [HealthController, 'liveness'])
router.get('/health/ready', [HealthController, 'readiness'])
