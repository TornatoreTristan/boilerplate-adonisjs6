import type { HealthCheck, HealthCheckResult, HealthCheckConfig } from '#health/types/health'

export abstract class BaseHealthCheck implements HealthCheck {
  abstract name: string
  protected config: HealthCheckConfig = {
    timeout: 5000,
    critical: true,
  }

  abstract check(): Promise<HealthCheckResult>

  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.config.timeout
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ])
  }

  protected measureLatency<T>(fn: () => Promise<T>): Promise<{ result: T; latency: number }> {
    const start = performance.now()
    return fn().then((result) => ({
      result,
      latency: Math.round(performance.now() - start),
    }))
  }
}
