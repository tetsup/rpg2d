import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: '/',

  resolve: {
    alias: {
      '@sharedTypes': resolve(__dirname, '../../packages/shared/src/types'),
      '@sharedStyles': resolve(__dirname, '../../packages/shared/src/styles'),
      '@base': resolve(__dirname, '../../packages/shared/src/base'),
    },
  },
});
