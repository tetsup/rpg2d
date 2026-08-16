import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup/setup.ts'],
  },

  resolve: {
    alias: {
      '@schema': path.resolve(__dirname, 'src/schema'),
      '@tests': path.resolve(__dirname, 'tests'),
      '@sharedTypes': path.resolve(__dirname, 'src/types'),
      '@sharedStyles': path.resolve(__dirname, 'src/styles'),
    },
  },
});
