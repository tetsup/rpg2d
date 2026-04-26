import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { realpathSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const web2dSrc = realpathSync(resolve(__dirname, 'node_modules/@tetsup/web2d/src'));

function resolveTsPath(...segments: string[]) {
  return `${resolve(...segments)}.ts`;
}

function web2dSourceAlias(): Plugin {
  return {
    name: 'web2d-source-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source === '@tetsup/web2d') return resolve(web2dSrc, 'index.ts');

      const normalizedImporter = importer?.replaceAll('\\', '/');
      const isWeb2dImporter =
        normalizedImporter?.includes('/@tetsup/web2d/src/') || normalizedImporter?.includes('/@tetsup+web2d@');

      if (!source.startsWith('@/') || !isWeb2dImporter) return null;
      return resolveTsPath(web2dSrc, source.slice(2));
    },
  };
}

function appSourceAlias(): Plugin {
  return {
    name: 'app-source-alias',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('@/')) return resolveTsPath(__dirname, 'src', source.slice(2));
      if (source.startsWith('@dev/')) return resolveTsPath(__dirname, 'dev', source.slice(5));
      return null;
    },
  };
}

export default defineConfig({
  root: 'dev',
  base: './',
  publicDir: '../public',
  define: {
    'process.env.RESOURCE_URI': JSON.stringify('/api/resources'),
  },
  worker: {
    plugins: () => [web2dSourceAlias()],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  plugins: [
    web2dSourceAlias(),
    appSourceAlias(),
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
