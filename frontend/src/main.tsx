import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import App from './App'
import './styles/global.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

const root = createRoot(rootEl)
root.render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
