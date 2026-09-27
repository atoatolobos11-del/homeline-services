import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // When running locally with the API on port 5000 (node server/server.js),
    // /api requests are forwarded so the storefront works end-to-end.
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})