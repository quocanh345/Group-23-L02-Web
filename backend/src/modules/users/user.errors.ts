import { AppError } from '../../lib/errors.js'

export class EmailTakenError extends AppError {
  constructor() {
    super('EMAIL_TAKEN', 'Email đã được sử dụng')
    this.name = 'EmailTakenError'
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super('NOT_FOUND', 'Người dùng không tồn tại')
    this.name = 'UserNotFoundError'
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('UNAUTHENTICATED', 'Email hoặc mật khẩu không đúng')
    this.name = 'InvalidCredentialsError'
  }
}
