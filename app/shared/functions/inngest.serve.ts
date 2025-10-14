/**
 * Configuration centrale d'Inngest
 * Regroupe toutes les functions et expose le handler pour AdonisJS
 */

import { Inngest } from 'inngest'

/**
 * Client Inngest partagé
 * À importer dans toutes les functions
 */
export const inngest = new Inngest({
  id: 'boilerplate-adonisjs6',
  // Schemas seront inférés automatiquement depuis les functions
})

/**
 * Import des functions
 * Ajouter ici toutes les nouvelles functions créées
 */
import { sendEmailFunction } from '#mailing/functions/send_email'
import { userWelcomeEmail } from '#auth/functions/user_welcome_email'
import { userOnboardingWorkflow } from '#auth/functions/user_onboarding_workflow'
// ... autres functions

/**
 * Liste de toutes les functions Inngest
 */
export const functions = [
  sendEmailFunction,
  userWelcomeEmail,
  userOnboardingWorkflow,
  // ... ajouter les autres functions ici
]
