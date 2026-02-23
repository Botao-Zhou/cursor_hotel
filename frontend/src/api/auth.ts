import { api } from './client'
import type { User, UserRole } from '@/contexts/AuthContext'

interface LoginRes {
  token: string
  user: User
}

interface RegisterRes {
  id: string
  username: string
  role: UserRole
}

export async function login(username: string, password: string) {
  const res = await api.post<LoginRes>('/auth/login', { username, password })
  if (res.code !== 0 || !res.data) throw new Error(res.message || '登录失败')
  return res.data
}

export async function register(username: string, password: string, role: UserRole) {
  const res = await api.post<RegisterRes>('/auth/register', { username, password, role })
  if (res.code !== 0) throw new Error(res.message || '注册失败')
  return res.data
}

export async function logout() {
  const res = await api.post<null>('/auth/logout')
  if (res.code !== 0) throw new Error(res.message || '退出失败')
  return res.data
}
