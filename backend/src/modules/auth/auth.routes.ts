import { Router } from 'express'
import { register, login, getMe, logout } from './auth.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'

const authRouter = Router()

//API đăng ký
authRouter.post('/register', register)
//API đăng nhập
authRouter.post('/login', login)
//API lấy người đang đăng nhập
authRouter.get('/me', authenticate, getMe)
//API đăng xuất
authRouter.post('/logout', authenticate, logout)

export default authRouter
