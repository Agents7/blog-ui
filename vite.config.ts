import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 假设后端服务运行在 8080 端口
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // 如果后端接口不带 /api 前缀，可以取消注释这行
      },
    },
  },
})
