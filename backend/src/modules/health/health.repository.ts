import prisma from '../../lib/prisma.js'

export class HealthRepository {
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection error:', error)
      return false
    }
  }
}

export const healthRepository = new HealthRepository()
