import { injectable } from 'inversify'
import Bull from 'bull'
import env from '#start/env'

@injectable()
export default class QueueService {
  private queues: Map<string, Bull.Queue> = new Map()

  /**
   * Get or create a queue
   */
  getQueue(name: string): Bull.Queue {
    if (!this.queues.has(name)) {
      const queue = new Bull(name, {
        redis: {
          host: env.get('REDIS_HOST'),
          port: env.get('REDIS_PORT'),
          password: env.get('REDIS_PASSWORD'),
        },
      })

      this.queues.set(name, queue)
    }

    return this.queues.get(name)!
  }

  /**
   * Add job to queue
   */
  async add(queueName: string, jobName: string, data: any, options?: Bull.JobOptions) {
    const queue = this.getQueue(queueName)
    return queue.add(jobName, data, options)
  }

  /**
   * Process jobs from queue
   */
  process(queueName: string, jobName: string, handler: Bull.ProcessCallbackFunction<any>) {
    const queue = this.getQueue(queueName)
    queue.process(jobName, handler)
  }

  /**
   * Close all queues
   */
  async closeAll() {
    await Promise.all(Array.from(this.queues.values()).map((queue) => queue.close()))
    this.queues.clear()
  }
}
