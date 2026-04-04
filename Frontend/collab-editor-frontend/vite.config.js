import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',   // 🔥 ADD THIS LINE
  },
  server: {
    proxy: {
      // Proxy /api and /ws to Spring Boot backend in local dev
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true, // important: enables WebSocket proxying
      },
    },
  },
})
