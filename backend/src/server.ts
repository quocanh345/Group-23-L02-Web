import express from 'express'
import indexRouter from './routes/index.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use('/api', indexRouter)

app.listen(port, () => {
  console.log(`Backend đang chạy tại http://localhost:${port}`)
})
