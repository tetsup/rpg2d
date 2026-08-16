import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const outfile = resolve(root, 'apps/api/dist/lambda/index.cjs');

await esbuild.build({
  entryPoints: [resolve(root, 'apps/api/src/lambda.ts')],
  outfile,
  bundle: true,
  external: ['@aws-sdk/*'],
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  mainFields: ['module', 'main'],
  alias: {
    '@api': resolve(root, 'apps/api/src'),
    '@database': resolve(root, 'packages/database/src'),
    '@schema': resolve(root, 'packages/shared/src/schema'),
    '@sharedTypes': resolve(root, 'packages/shared/src/types'),
  },
  logLevel: 'info',
});

console.log(`Lambda bundle written to ${outfile}`);
