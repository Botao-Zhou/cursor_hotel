import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5174,
        // 若仍出现 WebSocket 400，可改为 hmr: false 关闭热更新（仅整页刷新）
        hmr: {
            protocol: 'ws',
            host: 'localhost',
            port: 5174,
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
