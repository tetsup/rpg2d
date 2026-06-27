import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');

  return {
    test: {
      env,
      globals: true,
      environment: 'node',
      include: ['tests/**/*.test.{ts,tsx}'],
    },

    resolve: {
      alias: {
        '@database': path.resolve(__dirname, 'src'),
        '@tests': path.resolve(__dirname, 'tests'),
        '@schema': path.resolve(__dirname, '../schema/src'),
        '@sharedTypes': path.resolve(__dirname, '../../types'),
      },
    },
  };
});
