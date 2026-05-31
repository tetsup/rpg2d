import { migrate } from '../../migration/migrate';
import { shutdownMongo } from '@database/client/mongo-client';

beforeAll(async () => {
  process.env.MONGO_DB = `test_${process.env.VITEST_POOL_ID}`;
  await migrate();
});

afterAll(async () => {
  await shutdownMongo();
});
