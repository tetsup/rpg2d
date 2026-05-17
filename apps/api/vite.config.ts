import { defineConfig, UserConfig } from 'vite';
import devServer from '@hono/vite-dev-server';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    devServer({
      entry: 'src/index.ts',
    }),
  ],

  server: {
    port: 3000,
    strictPort: true,
  },
} as UserConfig);
