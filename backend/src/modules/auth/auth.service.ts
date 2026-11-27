import bcrypt from 'bcryptjs'
import { AppError } from '../../lib/errors.js'
import { UserRepository, type SafeUser } from '../users/user.repository.js'
import { EmailTakenError } from '../users/user.errors.js'

type RegisterData = {
  email: string
  password: string
  fullName: string
}

type LoginData = {
  email: string
  password: string
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  //Đăng ký
  async register(data: RegisterData): Promise<SafeUser> {
    const existingUser = await this.userRepository.findByEmail(data.email)

    if (existingUser) {
      throw new AppError('EMAIL_TAKEN', 'Email đã được sử dụng')
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    try {
      return await this.userRepository.create({
        email: data.email,
        passwordHash,
        fullName: data.fullName,
      })
    } catch (error) {
      //2 request trùng email 1 lúc
      if (error instanceof EmailTakenError) {
        throw new AppError('EMAIL_TAKEN', 'Email đã được sử dụng')
      }
      throw error
    }
  }

  async login(data: LoginData): Promise<SafeUser> {
    const user = await this.userRepository.findByEmailWithPassword(data.email)

    if (!user) {
      throw new AppError('UNAUTHENTICATED', 'Email hoặc mật khẩu không đúng')
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    )

    if (!isPasswordValid) {
      throw new AppError('UNAUTHENTICATED', 'Email hoặc mật khẩu không đúng')
    }

    //Không trả passwordHash
    const { passwordHash, ...safeUser } = user

    return safeUser
  }
}

export const authService = new AuthService(new UserRepository())
