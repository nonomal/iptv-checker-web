import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'./',
  server: {
    proxy: {
      '/check-url-is-available': {
        target: 'http://127.0.0.1:8089',
        changeOrigin: true,
      },
      '/fetch-m3u-body': {
        target: 'http://127.0.0.1:8089',
        changeOrigin: true,
      },
      '^/system/.*': {
        target: 'http://127.0.0.1:8089',
        changeOrigin: true,
      },
      '^/tasks/.*': {
        target: 'http://127.0.0.1:8089',
        changeOrigin: true,
      },
      '^/media/.*': {
        target: 'http://127.0.0.1:8089',
        changeOrigin: true,
      },
      '^/static/.*': {
        target: 'http://127.0.0.1:8089',
        changeOrigin: true,
      },
    }
  }
})
