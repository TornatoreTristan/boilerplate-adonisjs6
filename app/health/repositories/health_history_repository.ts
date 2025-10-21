import { injectable } from 'inversify'
import { BaseRepository } from '#shared/repositories/base_repository'
import HealthHistory from '#health/models/health_history'
import { DateTime } from 'luxon'

@injectable()
export default class HealthHistoryRepository extends BaseRepository<typeof HealthHistory> {
  protected model = HealthHistory

  async getHistory(limit: number = 100): Promise<HealthHistory[]> {
    return HealthHistory.query().orderBy('created_at', 'desc').limit(limit)
  }

  async getHistorySince(since: DateTime, limit: number = 1000): Promise<HealthHistory[]> {
    return HealthHistory.query()
      .where('created_at', '>=', since.toSQL())
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  async getHistoryForPeriod(
    startDate: DateTime,
    endDate: DateTime
  ): Promise<HealthHistory[]> {
    return HealthHistory.query()
      .whereBetween('created_at', [startDate.toSQL(), endDate.toSQL()])
      .orderBy('created_at', 'asc')
  }

  async deleteOlderThan(date: DateTime): Promise<number> {
    const result = await this.db
      .from(this.tableName)
      .where('created_at', '<', date.toSQL())
      .delete()

    return result
  }
}
