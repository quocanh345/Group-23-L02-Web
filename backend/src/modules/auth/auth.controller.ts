import type { Request, Response } from 'express'
import { generateAccessToken } from './auth.utils.js'
import { COOKIE_NAME, cookieOptions } from './auth.cookie.js'
import { UserService } from '../users/user.service.js'
import {
  EmailTakenError,
  InvalidCredentialsError,
} from '../users/user.errors.js'

const userService = new UserService()

//chuẩn hóa Email
const normalizeEmail = (email: string) => {
  return email.trim().toLowerCase()
}
//kiểm tra Email
const isValidEmail = (email: string) => {
  const emaiRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emaiRegex.test(email)
}

type ValidationDetail = {
  field: string
  message: string
}
//Hàm trả lỗi chung
const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: ValidationDetail[],
) => {
  const errorData = {
    code,
    message,
    details,
  }
  return res.status(status).json({
    error: errorData,
  })
}

//Register
export const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body ?? {}

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof fullName !== 'string'
  ) {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Dữ liệu đăng ký không hợp lệ',
    )
  }
  const normalizedEmail = normalizeEmail(email)
  const normalizedName = fullName.trim()
  const errors: ValidationDetail[] = []

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
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Dữ liệu không hợp lệ',
      errors,
    )
  }

  try {
    //Gọi service đăng ký
    const user = await userService.register({
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
  } catch (error) {
    //2 request trùng email 1 lúc
    if (error instanceof EmailTakenError) {
      return sendError(res, 409, 'EMAIL_TAKEN', 'Email đã được sử dụng')
    }

    console.error('Register error: ', error)
    return sendError(res, 500, 'INTERNAL_ERROR', 'Đã xảy ra lỗi máy chủ')
  }
}

//Login
export const login = async (req: Request, res: Response) => {
  const body = req.body ?? {}
  const { email, password } = body
  const details: ValidationDetail[] = []

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
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Dữ liệu không hợp lệ',
      details,
    )
  }

  const normalizedEmail = normalizeEmail(email)

  if (
    !isValidEmail(normalizedEmail) ||
    normalizedEmail.length > 255 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ')
  }

  try {
    //Gọi service đăng nhập
    const user = await userService.login({
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
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return sendError(
        res,
        401,
        'UNAUTHENTICED',
        'Email hoặc mật khẩu không đúng',
      )
    }
    console.error('Login error: ', error)

    return sendError(res, 500, 'INTERNAL_ERROR', 'Đã xảy ra lỗi máy chủ')
  }
}
