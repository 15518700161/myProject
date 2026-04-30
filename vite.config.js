import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // i18n-runtime's package.json points to es/index.js which doesn't exist;
      // redirect to the CJS build that does exist
      'i18n-runtime': path.resolve(__dirname, 'node_modules/i18n-runtime/lib/index.js'),
    },
  },
  server: {
    proxy: {
      '/gateway/': {
        target: 'http://192.168.2.199',
        changeOrigin: true,
      },
      '/wstec/': {
        target: 'http://192.168.2.199',
        changeOrigin: true,
      },
      '/platRbac/': {
        target: 'http://192.168.2.199',
        changeOrigin: true,
      },
      '/wvp/': {
        target: 'http://192.168.2.199',
        changeOrigin: true,
      },
      '/dhapi/': {
        target: 'http://192.168.2.199',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'amis',
      'amis-core',
      'amis-ui',
      'amis-editor',
      'amis-editor-core',
      'i18n-runtime',
    ],
  },
})
