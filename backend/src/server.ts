import express from 'express'

const app = express()
const port = Number(process.env.PORT) || 3000

app.listen(port, () => {
  console.log(`Backend đang chạy tại http://localhost:${port}`)
})
