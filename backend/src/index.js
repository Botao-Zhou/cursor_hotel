import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: '易宿酒店 API 服务运行中' })
})

// 后续在此挂载：用户/酒店/审核等路由

app.listen(PORT, () => {
  console.log(`易宿酒店后端已启动: http://localhost:${PORT}`)
})
