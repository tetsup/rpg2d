import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const outfile = resolve(root, 'apps/api/dist/lambda/index.mjs');

mkdirSync(dirname(outfile), { recursive: true });

await esbuild.build({
  entryPoints: [resolve(root, 'apps/api/src/lambda.ts')],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  mainFields: ['module', 'main'],
  alias: {
    '@api': resolve(root, 'apps/api/src'),
    '@database': resolve(root, 'packages/database/src'),
    '@schema': resolve(root, 'packages/schema/src'),
    '@sharedTypes': resolve(root, 'types'),
  },
  logLevel: 'info',
});

console.log(`Lambda bundle written to ${outfile}`);
