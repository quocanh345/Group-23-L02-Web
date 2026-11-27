import * as z from 'zod'

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Email không hợp lệ').max(255, 'Email không hợp lệ')),
  password: z
    .string()
    .min(8, 'Mật khẩu phải từ 8 đến 72 ký tự')
    .refine(
      (val) => Buffer.byteLength(val, 'utf8') <= 72,
      'Mật khẩu phải từ 8 đến 72 ký tự',
    ),
  fullName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ và tên')
    .max(100, 'Họ và tên không được dài quá 100 ký tự'),
})

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Email không hợp lệ').max(255, 'Email không hợp lệ')),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})
