import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * PC 端鉴权：未登录跳转登录页；已登录且角色不匹配当前路径时按角色重定向
 */
export function PCAuthGuard({ children }: { children: React.ReactNode }) {
  const { token, user, isReady } = useAuth()
  const location = useLocation()
  const pathname = location.pathname

  if (!isReady) return null

  const isLoginPage = pathname === '/pc' || pathname === '/pc/login'
  if (isLoginPage) {
    if (!token || !user) return <>{children}</>
    if (user.role === 'merchant') return <Navigate to="/pc/merchant/list" replace />
    return <Navigate to="/pc/admin/review" replace />
  }

  if (!token || !user) {
    return <Navigate to="/pc/login" replace state={{ from: pathname }} />
  }

  const isMerchantPath = pathname.startsWith('/pc/merchant')
  const isAdminPath = pathname.startsWith('/pc/admin')
  if (isMerchantPath && user.role !== 'merchant') {
    return <Navigate to="/pc/admin/review" replace />
  }
  if (isAdminPath && user.role !== 'admin') {
    return <Navigate to="/pc/merchant/list" replace />
  }

  return <>{children}</>
}
