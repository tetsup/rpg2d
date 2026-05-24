import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: 'dev',
  base: '/rpg2d/',
  publicDir: resolve(__dirname, 'public'),
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  resolve: {
    alias: {
      '@engine': resolve(__dirname, 'packages/engine/src'),
      '@schema': resolve(__dirname, 'packages/schema/src'),
    },
  },
  plugins: [
    {
      name: 'log-forwarder',
      configureServer(server) {
        server.middlewares.use('/__log', (req, res) => {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const prefix =
                {
                  log: '🟢',
                  warn: '🟡',
                  error: '🔴',
                  info: '🔵',
                }[data.type] || '⚪';

              console.log(`${prefix} [${data.type}]`, ...data.args);
            } catch (e) {
              console.error('log parse error', e);
            }
            res.end('ok');
          });
        });
      },
    },
    {
      name: 'error-forwarder',
      configureServer(server) {
        server.middlewares.use('/__error', async (req, res) => {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              console.error('\n🔥 Frontend Error:');
              console.error(data.message);
              if (data.stack) console.error(data.stack);
            } catch (e) {
              console.error('parse error', e);
            }
            res.end('ok');
          });
        });
      },
    },
  ],
});
