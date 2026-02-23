import { fail } from '../utils/response.js'
import { tokenStore } from '../store/index.js'
import { USER_ROLE } from '../store/index.js'

/**
 * 校验登录态，将 user 写入 req.user
 */
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return fail(res, '未登录', 401, 401)
  }
  const session = tokenStore.get(token)
  if (!session) {
    return fail(res, '登录已过期，请重新登录', 401, 401)
  }
  req.user = session
  req.token = token
  next()
}

/**
 * 仅管理员
 */
export function requireAdmin(req, res, next) {
  if (req.user.role !== USER_ROLE.ADMIN) {
    return fail(res, '无权限', 403, 403)
  }
  next()
}

/**
 * 仅商户
 */
export function requireMerchant(req, res, next) {
  if (req.user.role !== USER_ROLE.MERCHANT) {
    return fail(res, '无权限', 403, 403)
  }
  next()
}
