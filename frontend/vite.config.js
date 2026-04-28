import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — cached separately, changes rarely
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Redux — cached separately
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // Swiper — largest lib, lazy-loaded anyway, keep isolated
          'vendor-swiper': ['swiper'],
          // Lucide icons
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
})

