import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? process.env.BACKEND_URL 
          : 'http://localhost:5002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
}); 