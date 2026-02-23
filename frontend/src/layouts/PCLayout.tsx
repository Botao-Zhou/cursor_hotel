import { Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import '@/styles/pc.css'

export default function PCLayout() {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="pc-layout">
        <header className="pc-header">
          <span className="pc-logo">易宿酒店 · 管理端</span>
        </header>
        <main className="pc-main">
          <Outlet />
        </main>
      </div>
    </ConfigProvider>
  )
}
