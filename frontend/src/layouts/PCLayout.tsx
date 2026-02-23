import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ConfigProvider, Button } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import { PCAuthGuard } from '@/pc/components/PCAuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/pc.css'

export default function PCLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, logout } = useAuth()
  const isLoginPage = location.pathname === '/pc/login'

  const handleLogout = () => {
    logout()
    navigate('/pc/login', { replace: true })
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className="pc-layout">
        <header className="pc-header">
          <span className="pc-logo">易宿酒店 · 管理端</span>
          {token && user && !isLoginPage && (
            <div className="pc-header-right">
              <span className="pc-header-user">{user.username}（{user.role === 'merchant' ? '商户' : '管理员'}）</span>
              <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} className="pc-header-logout">
                退出
              </Button>
            </div>
          )}
        </header>
        <main className="pc-main">
          <PCAuthGuard>
            <Outlet />
          </PCAuthGuard>
        </main>
      </div>
    </ConfigProvider>
  )
}
