import express from 'express'
import cors from 'cors'
import indexRouter from './routes/index.js'

import cookieParser from 'cookie-parser'

import type { Request, Response } from 'express'

import { errorHandler } from './middlewares/error.middleware.js'

const app = express()
const port = Number(process.env.PORT) || 3000

//CORS: cho phép Frontend gọi Backend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
)

//Cho phép Express đọc dữ liệu JSON
app.use(express.json())

//Đọc Cookie
app.use(cookieParser())

//Mọi route đều có tiền tố /api
app.use('/api', indexRouter)

//Đường dẫn không tồn tại
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`,
    },
  })
})

//Xử lý lỗi chung
app.use(errorHandler)

//Khởi động Server
app.listen(port, () => {
  console.log(`Backend đang chạy tại http://localhost:${port}`)
})
