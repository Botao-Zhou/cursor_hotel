import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import path from 'path'

function readBackendPortFromEnvFile(): string | undefined {
  const backendEnvPath = path.resolve(__dirname, '../backend/.env')
  if (!fs.existsSync(backendEnvPath)) return undefined
  const text = fs.readFileSync(backendEnvPath, 'utf-8')
  const line = text
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith('PORT='))
  if (!line) return undefined
  const value = line.slice(line.indexOf('=') + 1).trim()
  return value || undefined
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = env.VITE_BACKEND_PORT || readBackendPortFromEnvFile() || '3000'
  const apiTarget = env.VITE_API_TARGET || `http://localhost:${backendPort}`
  const devPort = Number(env.VITE_DEV_PORT) || 5174

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: devPort,
      // 若仍出现 WebSocket 400，可改为 hmr: false 关闭热更新（仅整页刷新）
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: devPort,
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
