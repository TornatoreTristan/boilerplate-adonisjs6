import router from '@adonisjs/core/services/router'
import app from '@adonisjs/core/services/app'
import { HttpContext } from '@adonisjs/core/http'
import { join } from 'node:path'
import { readFile, stat } from 'node:fs/promises'

router.get('/uploads/*', async ({ request, response }: HttpContext) => {
  const filePath = request.param('*').join('/')
  const fullPath = join(app.makePath('storage/uploads'), filePath)

  try {
    // Check if file exists
    const stats = await stat(fullPath)

    if (!stats.isFile()) {
      return response.notFound('File not found')
    }

    // Read and serve the file
    const fileBuffer = await readFile(fullPath)

    // Set content type based on extension
    const ext = filePath.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      webp: 'image/webp',
    }

    response.header('Content-Type', mimeTypes[ext || ''] || 'application/octet-stream')
    response.header('Cache-Control', 'public, max-age=31536000') // 1 year
    return response.send(fileBuffer)
  } catch (error) {
    return response.notFound('File not found')
  }
})
