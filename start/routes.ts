import router from '@adonisjs/core/services/router'

// Import all routes files
import './routes/auth_routes.js'
import './routes/session_routes.js'
import './routes/google_auth_routes.js'
import './routes/email_verification_routes.js'
import './routes/notification_routes.js'
import './routes/upload_routes.js'
import './routes/admin_routes.js'
import './routes/account_routes.js'
import './routes/organization_routes.js'
import { middleware } from './kernel.js'

// Import controllers
const InngestController = () => import('#shared/controllers/inngest_controller')

// Page d'accueil (protégée par authentification et nécessite une organisation)
router
  .on('/')
  .renderInertia('home')
  .use([middleware.auth(), middleware.requireOrganization(), middleware.organizationContext()])

// Route temporaire pour tester le middleware
router
  .get('/debug/current-organization', async ({ organization, response }) => {
    return response.json({
      id: organization.id,
      name: organization.name,
    })
  })
  .use([middleware.auth(), middleware.organizationContext()])

// ==========================================
// INNGEST API
// ==========================================

// Endpoint Inngest (appelé par Inngest Cloud/self-hosted)
// Supporte GET (health check) et POST/PUT (event handling)
router.any('/api/inngest', [InngestController, 'handle'])
