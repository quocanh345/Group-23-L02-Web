export class EmailTakenError extends Error {
  constructor() {
    super('Email đã tồn tại')
    this.name = 'EmailTakenError'
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('Người dùng không tồn tại')
    this.name = 'UserNotFoundError'
  }
}

export class InvalidCredentialsError extends Error {
    constructor(){
        super('Email hoặc mật khẩu không đúng')
        this.name = 'InvalidCredentialsError'
    }
}