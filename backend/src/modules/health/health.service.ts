import { healthRepository, type HealthRepository } from './health.repository.js'

type HealthResult = {
  status: 'ok' | 'error'
  database: 'ok' | 'error'
}
export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  async checkHealth(): Promise<HealthResult> {
    const databaseHealth = await this.healthRepository.checkDatabaseConnection()
    return {
      status: databaseHealth ? 'ok' : 'error',
      database: databaseHealth ? 'ok' : 'error',
    }
  }
}

export const healthService = new HealthService(healthRepository)
