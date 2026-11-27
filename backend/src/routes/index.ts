import { Router } from 'express'
import healthRoutes from '../modules/health/health.routes.js'
import authRouter from '../modules/auth/auth.routes.js';

const indexRouter = Router()

indexRouter.use('/health', healthRoutes)
indexRouter.use('/auth', authRouter)

export default indexRouter
