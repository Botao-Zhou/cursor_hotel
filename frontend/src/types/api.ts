/**
 * 接口响应统一结构
 */

export interface ApiRes<T = unknown> {
  code: number
  message: string
  data: T
}
