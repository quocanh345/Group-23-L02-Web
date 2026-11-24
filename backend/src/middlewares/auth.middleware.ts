import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../modules/auth/auth.utils.js'
import { COOKIE_NAME } from '../modules/auth/auth.cookie.js'

//Mở rộng kiểu Request để lưu tt user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number
        role: string
      }
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //Đọc JWT từ Cookie
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Bạn chưa đăng nhập',
      },
    })
  }

  try {
    const payLoad = verifyAccessToken(token)
    req.user = {
      userId: payLoad.userId,
      role: payLoad.role,
    }

    return next()
  } catch {
    return res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      },
    })
  }
}
