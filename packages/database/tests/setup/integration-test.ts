import { test as base } from 'vitest';
import { prepareWorkerSchema, teardownWorkerSchema } from './worker-schema';

export const test = base.extend({
  dbWorker: [
    async ({}, use) => {
      const schemaName = await prepareWorkerSchema();
      await use(schemaName);
      await teardownWorkerSchema(schemaName);
    },
    { scope: 'worker', auto: true },
  ],
});

export const describe = test.describe;
export const it = test;
export const beforeEach = test.beforeEach;
export const afterEach = test.afterEach;
