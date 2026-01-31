import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/resume': {
        target: 'https://team-404-found-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://team-404-found.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/scrape': {
        target: 'https://your-app.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
