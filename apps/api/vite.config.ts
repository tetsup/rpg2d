import { defineConfig, loadEnv, UserConfig } from 'vite';
import devServer from '@hono/vite-dev-server';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');

  return {
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
    define: mode === 'development' || mode === 'test' ? { 'process.env': { ...process.env, ...env } } : {},
  } as UserConfig;
});
