/**
 * 用户与角色：前后端交互统一类型
 */

export type UserRole = 'merchant' | 'admin'

export interface User {
  id: string
  username: string
  role: UserRole
}
