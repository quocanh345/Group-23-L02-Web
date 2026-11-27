import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../lib/errors.js'

const getBodyParserErrorType = (error: unknown): string | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof error.type === 'string'
  ) {
    return error.type
  }
  return undefined
}

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(error)
  }

  //TH1: Lỗi chủ động
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      console.error('AppError:', error)
    }
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    })
  }

  //TH2: Client gửi JSON sai cú pháp hoặc quá lớn
  const bodyErrorType = getBodyParserErrorType(error)
  if (bodyErrorType === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên không đúng định dạng JSON',
      },
    })
  }

  if (bodyErrorType === 'entity.too.large') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên quá lớn',
      },
    })
  }

  //TH3: Lỗi lạ
  console.error('Lỗi hệ thống:', error)
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Đã xảy ra lỗi máy chủ',
    },
  })
}
