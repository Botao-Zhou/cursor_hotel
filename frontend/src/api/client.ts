/**
 * 请求封装：统一 baseURL、JSON、标准响应 { code, message, data }
 */
import type { ApiRes } from '@/types/api'

const BASE = '/api'

export type { ApiRes }

async function request<T = unknown>(
  url: string,
  options: RequestInit & { body?: object } = {}
): Promise<ApiRes<T>> {
  const { body, ...rest } = options
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('pc_token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE}${url}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : options.body,
  })
  const json = (await res.json().catch(() => ({}))) as ApiRes<T>
  if (!res.ok) {
    throw new Error(json.message || `HTTP ${res.status}`)
  }
  return json
}

export const api = {
  get: <T = unknown>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T = unknown>(url: string, body?: object) =>
    request<T>(url, { method: 'POST', body }),
  put: <T = unknown>(url: string, body?: object) =>
    request<T>(url, { method: 'PUT', body }),
  delete: <T = unknown>(url: string) => request<T>(url, { method: 'DELETE' }),
}
