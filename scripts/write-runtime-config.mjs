import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? '';

writeFileSync(
  resolve(root, 'apps/runtime/public/config.js'),
  `window.__RUNTIME_CONFIG__ = { API_BASE_URL: ${JSON.stringify(apiBaseUrl)} };\n`,
);

console.log(`Runtime config written with API_BASE_URL=${JSON.stringify(apiBaseUrl)}`);
