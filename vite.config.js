import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_API_BASE_URL || 'https://khurana-enterprise-backend.onrender.com'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/bill': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/sales': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/stock': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
