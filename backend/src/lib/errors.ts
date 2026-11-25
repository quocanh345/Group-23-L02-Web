export const ERROR_STATUS = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  AI_QUOTA_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
  AI_PROVIDER_ERROR: 502,

  EMAIL_TAKEN: 409,
  ATTEMPT_ALREADY_SUBMITTED: 409,
  TIME_EXPIRED: 409,
  EMPTY_QUESTION_SET: 409,
  NO_WRONG_QUESTIONS: 409,
  CANNOT_CHANGE_OWN_ROLE: 409,
} as const

export type ErrorCode = keyof typeof ERROR_STATUS

export type ErrorDetail = {
  field: string
  message: string
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: ErrorDetail[]

  constructor(code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = ERROR_STATUS[code]
    this.details = details
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy dữ liệu') {
    super('NOT_FOUND', message)
    this.name = 'NotFoundError'
  }
}
