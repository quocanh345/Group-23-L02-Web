import { Prisma, type User } from '../../generated/prisma/client.js'
import prisma from '../../lib/prisma.js'
import { EmailTakenError, UserNotFoundError } from './user.errors.js'

const safeUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect

export type SafeUser = Omit<User, 'passwordHash'>

export class UserRepository {
  async findById(id: number): Promise<SafeUser | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    })
  }

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'role'>,
  ): Promise<SafeUser> {
    try {
      return await prisma.user.create({
        data,
        select: safeUserSelect,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new EmailTakenError()
        }
      }
      throw error
    }
  }

  async update(
    id: number,
    data: Partial<Omit<User, 'id' | 'createdAt' | 'role'>>,
  ): Promise<SafeUser> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
        select: safeUserSelect,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new EmailTakenError()
        }
        if (error.code === 'P2025') {
          throw new UserNotFoundError()
        }
      }
      throw error
    }
  }

  async delete(id: number): Promise<SafeUser> {
    try {
      return await prisma.user.delete({
        where: { id },
        select: safeUserSelect,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new UserNotFoundError()
        }
      }
      throw error
    }
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    // dùng cho kiểm tra đăng kí
    return await prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    })
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    // dùng cho đăng nhập để kiểm tra mật khẩu
    return await prisma.user.findUnique({
      where: { email },
    })
  }
}
