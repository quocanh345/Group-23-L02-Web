import * as z from 'zod'
import { AppError, type ErrorDetail } from './errors.js'

z.config(z.locales.vi())

export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data ?? {})

  if (!result.success) {
    const details: ErrorDetail[] = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    throw new AppError('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', details)
  }

  return result.data
}
