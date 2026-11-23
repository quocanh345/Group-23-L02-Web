import { healthService } from './health.service.js'
import type { Request, Response } from 'express'

export const getHealth = async (_req: Request, res: Response) => {
  const healthResult = await healthService.checkHealth()
  return res
    .status(healthResult.status === 'ok' ? 200 : 503)
    .json({ data: healthResult })
}
