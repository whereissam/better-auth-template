import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:4200',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV !== 'production',
  },
});
