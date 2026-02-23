import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { success } from './utils/response.js'
import authRouter from './routes/auth.js'
import hotelsRouter from './routes/hotels.js'
import adminRouter from './routes/admin.js'

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

// 健康检查
app.get('/api/health', (req, res) => {
  success(res, { ok: true, message: '易宿酒店 API 服务运行中' })
})

// 认证：注册、登录、登出
app.use('/api/auth', authRouter)

// 酒店：列表、详情、商户上传/编辑
app.use('/api/hotels', hotelsRouter)

// 管理员：审核列表、通过/拒绝/下线/恢复
app.use('/api/admin', adminRouter)

// 全局错误处理，避免未捕获异常导致 500 无内容
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ code: 500, message: err.message || 'Internal Server Error', data: null })
})

app.listen(PORT, () => {
  console.log(`易宿酒店后端已启动: http://localhost:${PORT}`)
})
