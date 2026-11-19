import express from 'express'
import authRouter from './modules/auth/auth.routes.js';

const app = express()
const port = Number(process.env.PORT) || 3000

//Cho phép Express đọc dữ liệu JSON
app.use(express.json());

//Đăng ký nhóm API xác thực
app.use('/api/auth', authRouter);

//Khởi động Server
app.listen(port, () => {
  console.log(`Backend đang chạy tại http://localhost:${port}`)
})
