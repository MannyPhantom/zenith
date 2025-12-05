import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // Exclude certain files from fast refresh that cause issues
      exclude: [/node_modules/],
      include: ['**/*.tsx', '**/*.ts'],
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    hmr: {
      overlay: true,
    },
    watch: {
      // Ignore certain patterns that might cause excessive reloads
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb for lucide-react
    rollupOptions: {
      output: {
        manualChunks: {
          'lucide-react': ['lucide-react'],
        },
      },
    },
  },
})
