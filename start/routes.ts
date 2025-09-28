import router from '@adonisjs/core/services/router'

// Import all routes files
import './routes/auth_routes.js'
import './routes/session_routes.js'

router.on('/').renderInertia('home')
