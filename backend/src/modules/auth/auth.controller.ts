import type { Request, Response } from 'express'
import { generateAccessToken } from './auth.utils.js'
import { COOKIE_NAME, cookieOptions } from './auth.cookie.js'
import { UserService } from '../users/user.service.js'

import { validate } from '../../lib/validate.js'
import { registerSchema, loginSchema } from './auth.schema.js'

const userService = new UserService()

//Register
export const register = async (req: Request, res: Response) => {
  const data = validate(registerSchema, req.body)

  //Gọi service đăng ký
  const user = await userService.register({
    email: data.email,
    password: data.password,
    fullName: data.fullName,
  })

  //Tạo JWT
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  })
  //Lưu JWT trong HTTPOnly Cookie
  res.cookie(COOKIE_NAME, accessToken, cookieOptions)

  return res.status(201).json({ data: user })
}

//Login
export const login = async (req: Request, res: Response) => {
  const data = validate(loginSchema, req.body)

  //Gọi service đăng nhập
  const user = await userService.login({
    email: data.email,
    password: data.password,
  })

  //Tạo JWT
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  })

  res.cookie(COOKIE_NAME, accessToken, cookieOptions)

  return res.status(200).json({
    data: user,
  })
}
