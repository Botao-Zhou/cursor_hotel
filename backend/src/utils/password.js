import crypto from 'crypto'

const SALT = process.env.PASSWORD_SALT || 'yisu_demo_salt'
const KEYLEN = 64

function isHexHash(value) {
  return typeof value === 'string' && /^[a-f0-9]{128}$/i.test(value)
}

export function hashPassword(password) {
  return crypto.scryptSync(String(password), SALT, KEYLEN).toString('hex')
}

export function verifyPassword(password, hashed) {
  // 兼容旧数据：若历史数据仍是明文，先允许登录，登录后由上层升级为 hash。
  if (!isHexHash(hashed)) {
    return String(password) === String(hashed || '')
  }
  const input = hashPassword(password)
  const a = Buffer.from(input, 'hex')
  const b = Buffer.from(String(hashed || ''), 'hex')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function isPasswordHashed(password) {
  return isHexHash(password)
}
