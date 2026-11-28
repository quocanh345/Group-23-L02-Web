import type { Request, Response } from 'express'
import { AppError, type ErrorDetail } from '../../lib/errors.js'
import { generateAccessToken } from './auth.utils.js'
import { COOKIE_NAME, cookieOptions } from './auth.cookie.js'
import { authService } from './auth.service.js'

//chuẩn hóa Email
const normalizeEmail = (email: string) => {
  return email.trim().toLowerCase()
}
//kiểm tra Email
const isValidEmail = (email: string) => {
  const emaiRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emaiRegex.test(email)
}

//Register
export const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body ?? {}

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof fullName !== 'string'
  ) {
    throw new AppError('VALIDATION_ERROR', 'Dữ liệu đăng ký không hợp lệ')
  }

  const normalizedEmail = normalizeEmail(email)
  const normalizedName = fullName.trim()
  const errors: ErrorDetail[] = []

  if (!isValidEmail(normalizedEmail) || normalizedEmail.length > 255) {
    errors.push({ field: 'email', message: 'Email không hợp lệ' })
  }
  if (
    password.length < 8 ||
    password.length > 72 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    errors.push({ field: 'password', message: 'Mật khẩu từ 8-72 ký tự' })
  }
  if (normalizedName.length < 1 || normalizedName.length > 100) {
    errors.push({ field: 'fullName', message: 'Họ tên từ 1-100 ký tự' })
  }

  if (errors.length > 0) {
    throw new AppError('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', errors)
  }

  //Gọi service đăng ký
  const user = await authService.register({
    email: normalizedEmail,
    password,
    fullName: normalizedName,
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
  const body = req.body ?? {}
  const { email, password } = body
  const details: ErrorDetail[] = []

  if (typeof email !== 'string' || !email.trim()) {
    details.push({
      field: 'email',
      message: 'Vui lòng nhập email',
    })
  }

  if (typeof password !== 'string' || !password) {
    details.push({
      field: 'password',
      message: 'Vui lòng nhập mật khẩu',
    })
  }

  if (details.length > 0) {
    throw new AppError('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', details)
  }

  const normalizedEmail = normalizeEmail(email)

  if (
    !isValidEmail(normalizedEmail) ||
    normalizedEmail.length > 255 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw new AppError('VALIDATION_ERROR', 'Dữ liệu không hợp lệ')
  }

  //Gọi service đăng nhập
  const user = await authService.login({
    email: normalizedEmail,
    password,
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

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('UNAUTHENTICATED', 'Bạn chưa đăng nhập')
  }

  const user = await authService.getCurrentUser(req.user.userId)

  return res.status(200).json({ data: user })
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, cookieOptions)

  return res.status(204).end()
}
