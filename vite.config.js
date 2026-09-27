import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/bill': 'http://localhost:8087',
      '/sales': 'http://localhost:8087',
      '/stock': 'http://localhost:8087',
    }
  }
})
