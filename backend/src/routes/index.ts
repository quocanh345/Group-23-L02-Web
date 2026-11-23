import { Router } from 'express'
import healthRoutes from '../modules/health/health.routes.js'

const indexRouter = Router()

indexRouter.use('/health', healthRoutes)

export default indexRouter
