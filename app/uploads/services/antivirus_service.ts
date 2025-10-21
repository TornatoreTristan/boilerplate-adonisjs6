import { injectable } from 'inversify'
import NodeClam from 'clamscan'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

export interface ScanResult {
  isInfected: boolean
  viruses: string[]
  file: string
}

@injectable()
export default class AntivirusService {
  private clamscan: NodeClam | null = null
  private isAvailable: boolean = false
  private initPromise: Promise<void> | null = null

  constructor() {
    // Initialize ClamAV asynchronously
    this.initPromise = this.initialize()
  }

  /**
   * Initialize ClamAV scanner
   */
  private async initialize(): Promise<void> {
    try {
      const clamAVEnabled = env.get('CLAMAV_ENABLED', 'false') === 'true'

      if (!clamAVEnabled) {
        logger.warn('ClamAV is disabled in configuration')
        this.isAvailable = false
        return
      }

      this.clamscan = await new NodeClam().init({
        removeInfected: false, // Don't auto-delete, let app handle it
        quarantineInfected: false,
        scanLog: null,
        debugMode: env.get('NODE_ENV') === 'development',
        clamdscan: {
          socket: env.get('CLAMAV_SOCKET', '/var/run/clamav/clamd.ctl'),
          host: env.get('CLAMAV_HOST', 'localhost'),
          port: parseInt(env.get('CLAMAV_PORT', '3310')),
          timeout: 60000,
          localFallback: true, // Fallback to local clamscan if socket fails
        },
        preference: 'clamdscan', // Prefer socket for better performance
      })

      this.isAvailable = true
      logger.info('✅ ClamAV antivirus service initialized successfully')
    } catch (error) {
      logger.warn('⚠️  ClamAV not available. File uploads will proceed without virus scanning.', {
        error: error.message,
      })
      logger.warn(
        'To enable antivirus scanning, install ClamAV: brew install clamav (macOS) or apt-get install clamav (Linux)'
      )
      this.isAvailable = false
    }
  }

  /**
   * Check if antivirus is available
   */
  async isReady(): Promise<boolean> {
    await this.initPromise
    return this.isAvailable
  }

  /**
   * Scan a file for viruses
   */
  async scanFile(filePath: string): Promise<ScanResult> {
    await this.initPromise

    if (!this.isAvailable || !this.clamscan) {
      logger.warn(`⚠️  Skipping virus scan for ${filePath} - ClamAV not available`)
      return {
        isInfected: false,
        viruses: [],
        file: filePath,
      }
    }

    try {
      const { isInfected, viruses, file } = await this.clamscan.isInfected(filePath)

      if (isInfected) {
        logger.error(`🦠 VIRUS DETECTED in ${file}: ${viruses.join(', ')}`)
      } else {
        logger.debug(`✅ File ${file} is clean`)
      }

      return {
        isInfected,
        viruses: viruses || [],
        file,
      }
    } catch (error) {
      logger.error('Failed to scan file for viruses', {
        file: filePath,
        error: error.message,
      })

      // On error, allow upload with warning (don't block workflow)
      logger.warn(
        `⚠️  Virus scan failed for ${filePath}, allowing upload (error: ${error.message})`
      )
      return {
        isInfected: false,
        viruses: [],
        file: filePath,
      }
    }
  }

  /**
   * Scan a buffer (in-memory file)
   */
  async scanBuffer(buffer: Buffer, filename: string = 'buffer'): Promise<ScanResult> {
    await this.initPromise

    if (!this.isAvailable || !this.clamscan) {
      logger.warn(`⚠️  Skipping virus scan for buffer - ClamAV not available`)
      return {
        isInfected: false,
        viruses: [],
        file: filename,
      }
    }

    try {
      const { isInfected, viruses } = await this.clamscan.scanStream(buffer)

      if (isInfected) {
        logger.error(`🦠 VIRUS DETECTED in ${filename}: ${viruses?.join(', ')}`)
      } else {
        logger.debug(`✅ Buffer ${filename} is clean`)
      }

      return {
        isInfected,
        viruses: viruses || [],
        file: filename,
      }
    } catch (error) {
      logger.error('Failed to scan buffer for viruses', {
        filename,
        error: error.message,
      })

      // On error, allow upload with warning
      logger.warn(
        `⚠️  Virus scan failed for buffer ${filename}, allowing upload (error: ${error.message})`
      )
      return {
        isInfected: false,
        viruses: [],
        file: filename,
      }
    }
  }

  /**
   * Get ClamAV version info
   */
  async getVersion(): Promise<string | null> {
    await this.initPromise

    if (!this.isAvailable || !this.clamscan) {
      return null
    }

    try {
      const version = await this.clamscan.getVersion()
      return version
    } catch (error) {
      logger.error('Failed to get ClamAV version', { error: error.message })
      return null
    }
  }
}
