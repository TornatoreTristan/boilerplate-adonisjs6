/**
 * Controller pour exposer l'endpoint Inngest
 * Route : POST /api/inngest
 */

import type { HttpContext } from '@adonisjs/core/http'
import { serve } from 'inngest/express'
import { inngest, functions } from '#shared/functions/inngest.serve'

export default class InngestController {
  /**
   * Handler Inngest
   * Expose l'endpoint pour que Inngest Cloud puisse appeler nos functions
   */
  async handle({ request, response }: HttpContext) {
    // Configuration du handler Inngest
    const handler = serve({
      client: inngest,
      functions,
    })

    // Convertir la request/response AdonisJS en Node.js standard
    const nodeReq = request.request
    const nodeRes = response.response

    // Appeler le handler Inngest
    return new Promise((resolve, reject) => {
      // Capture la réponse
      const originalEnd = nodeRes.end
      const originalWrite = nodeRes.write
      let body = ''

      nodeRes.write = function (chunk: any) {
        body += chunk
        return true
      }

      nodeRes.end = function (chunk?: any) {
        if (chunk) {
          body += chunk
        }

        // Restaurer les méthodes originales
        nodeRes.write = originalWrite
        nodeRes.end = originalEnd

        // Envoyer la réponse via AdonisJS
        response.status(nodeRes.statusCode || 200)

        // Copier les headers
        const headers = nodeRes.getHeaders()
        Object.entries(headers).forEach(([key, value]) => {
          response.header(key, value as string)
        })

        // Retourner le body
        resolve(body)
        return nodeRes
      } as any

      // Appeler le handler
      handler(nodeReq, nodeRes)
    })
  }
}
