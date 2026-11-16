import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // as chamadas relativas (/api/...) van ao backend en local
      '/api': 'http://localhost:3000'
    }
  }
})
