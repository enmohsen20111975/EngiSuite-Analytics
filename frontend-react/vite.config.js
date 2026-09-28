import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind all interfaces so both localhost and 127.0.0.1 work on Windows.
    host: true,
    port: 4000,
    strictPort: true,
    proxy: {
      // Proxy auth requests to Node backend (regex requires '/' after prefix
      // so SPA routes like /auth/callback are NOT proxied)
      '^/auth/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy API requests to Node backend
      '^/api/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy analytics API requests (regex prevents clash with /analytics SPA route)
      '^/analytics/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy calculation requests
      '^/calculate/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy user data requests
      '^/user-data/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy admin requests (regex prevents clash with /admin SPA routes)
      '^/admin/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy AI requests (regex prevents clash with /ai-assistant SPA route)
      '^/ai/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy payments
      '^/payments/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy learning (regex prevents clash with /learning SPA route)
      '^/learning/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy projects (regex prevents clash with /projects SPA routes)
      '^/projects/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy reporting
      '^/reporting/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy canvas API (no SPA route conflicts; allow bare prefix)
      '^/canvas/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy VDA (regex prevents clash with /vda SPA route if any)
      '^/vda/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy prices
      '^/prices/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy posts/social
      '^/posts/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy telegram
      '^/telegram/': {
        target: 'http://127.0.0.1:4001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
