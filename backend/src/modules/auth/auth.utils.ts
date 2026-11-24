import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken'
//Kiểu dữ liệu lưu bên trong JWT
export interface AuthPayload extends JwtPayload {
  userId: number
  role: string
}

//Đọc cấu hình từ .env
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET chưa được cấu hình hoặc quá ngắn')
}

//Tạo JWT
export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
    },
  )
}

//Xác minh JWT
export const verifyAccessToken = (token: string): AuthPayload => {
  const decoded = jwt.verify(token, JWT_SECRET)

  if (
    typeof decoded === 'string' ||
    typeof decoded.userId !== 'number' ||
    typeof decoded.role !== 'string'
  ) {
    throw new Error('JWT payload không hợp lệ')
  }
  return decoded as AuthPayload
}
