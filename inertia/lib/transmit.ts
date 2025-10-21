import { Transmit } from '@adonisjs/transmit-client'

// Singleton Transmit instance partagé par toute l'application
let transmitInstance: Transmit | null = null

export function getTransmitInstance(): Transmit {
  if (!transmitInstance) {
    transmitInstance = new Transmit({
      baseUrl: window.location.origin,
    })
  }
  return transmitInstance
}
