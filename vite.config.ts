import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/rust-it-up/',
  build: {
    rollupOptions: {
      output: {
        // Split the framework into a stable vendor chunk so it caches across
        // deploys independently of app code changes.
        manualChunks(id) {
          if (id.includes('/node_modules/')) return 'vendor'
        },
      },
    },
  },
})
