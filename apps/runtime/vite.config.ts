import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  publicDir: resolve(__dirname, 'public'),
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    port: 5174,
    strictPort: true,
  },

  resolve: {
    alias: {
      '@viewer': resolve(__dirname, 'src'),
      '@runtime': resolve(__dirname, '../runtime/src'),
      '@engine': resolve(__dirname, '../../packages/engine/src'),
      '@schema': resolve(__dirname, '../../packages/schema/src'),
    },
  },

  plugins: [
    react(),
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
