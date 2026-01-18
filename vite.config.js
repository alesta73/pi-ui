import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/stats': 'http://localhost:3001',
      '/docker': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'dist', // This matches the folder server.js looks for
    emptyOutDir: true,
  }
})