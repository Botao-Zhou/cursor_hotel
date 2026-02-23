import { Outlet } from 'react-router-dom'
import { ConfigProvider } from 'react-vant'
import '@/styles/h5.css'

export default function H5Layout() {
  return (
    <ConfigProvider>
      <div className="h5-layout">
        <main className="h5-main">
          <Outlet />
        </main>
      </div>
    </ConfigProvider>
  )
}
