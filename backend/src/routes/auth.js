import { Router } from 'express'
import { success, fail } from '../utils/response.js'
import { users, tokenStore, USER_ROLE, nextId } from '../store/index.js'

const router = Router()

/**
 * POST /api/auth/register
 * body: { username, password, role }  role: 'merchant' | 'admin'
 */
router.post('/register', (req, res) => {
  const { username, password, role } = req.body || {}
  if (!username || !password || !role) {
    return fail(res, '缺少参数：username, password, role')
  }
  if (![USER_ROLE.MERCHANT, USER_ROLE.ADMIN].includes(role)) {
    return fail(res, 'role 必须为 merchant 或 admin')
  }
  if (users.some((u) => u.username === username)) {
    return fail(res, '用户名已存在')
  }
  const id = nextId('user')
  const user = { id, username, password, role }
  users.push(user)
  return success(res, {
    id: user.id,
    username: user.username,
    role: user.role,
  }, '注册成功')
})

/**
 * POST /api/auth/login
 * body: { username, password }
 * 自动根据账号判断角色，返回 token 与用户信息
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return fail(res, '缺少参数：username, password')
  }
  const user = users.find((u) => u.username === username && u.password === password)
  if (!user) {
    return fail(res, '用户名或密码错误')
  }
  const token = `tk_${Date.now()}_${Math.random().toString(36).slice(2)}`
  tokenStore.set(token, { userId: user.id, role: user.role })
  return success(res, {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  }, '登录成功')
})

/**
 * POST /api/auth/logout（可选：清除服务端 token）
 * header: Authorization: Bearer <token>
 */
router.post('/logout', (req, res) => {
  const auth = req.headers.authorization
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (token) tokenStore.delete(token)
  return success(res, null, '已退出')
})

export default router
