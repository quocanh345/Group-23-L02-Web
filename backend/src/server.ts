import express from 'express'
import cors from "cors";
import cookieParser from 'cookie-parser';

import type { Request,Response } from "express";

import authRouter from './modules/auth/auth.routes.js';
import { error } from 'node:console';

const app = express()
const port = Number(process.env.PORT) || 3000


//Cho phép Express đọc dữ liệu JSON
app.use(express.json());

//Đọc Cookie
app.use(cookieParser());

//CORS: cho phép Frontend gọi Backend
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

//Mọi route đều có tiền tố /api
const apiRouter = express.Router();
apiRouter.use('/auth',authRouter);

app.use('/api', apiRouter);

//Đường dẫn không tồn tại
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error:{
      code: "NOT_FOUND",
      message: `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`
    }
  })
})

//Khởi động Server
app.listen(port, () => {
  console.log(`Backend đang chạy tại http://localhost:${port}`)
})


