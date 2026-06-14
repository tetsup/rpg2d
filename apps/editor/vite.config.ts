import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@editor': resolve(__dirname, 'src'),
      '@runtime': resolve(__dirname, '../runtime/src'),
      '@engine': resolve(__dirname, '../../packages/engine/src'),
      '@database': resolve(__dirname, '../../packages/database/src'),
      '@schema': resolve(__dirname, '../../packages/schema/src'),
      '@sharedTypes': resolve(__dirname, '../../types'),
    },
  },
});
