import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: process.env.VITE_BASE_PATH ?? '/',

  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
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
      '@schema': resolve(__dirname, '../../packages/shared/src/schema'),
      '@sharedTypes': resolve(__dirname, '../../packages/shared/src/types'),
      '@sharedStyles': resolve(__dirname, '../../packages/shared/src/styles'),
      '@base': resolve(__dirname, '../../packages/shared/src/base'),
    },
  },
});
