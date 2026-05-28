import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';
import { migrate } from '../../migration/migrate';

let mongoServer: MongoMemoryReplSet;

export async function setupMongo() {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      storageEngine: 'wiredTiger',
    },
  });
  const uri = mongoServer.getUri();
  process.env.MONGO_URL = uri;
  await migrate();
}

export async function teardownMongo() {
  await mongoServer.stop();
}

beforeAll(async () => {
  await setupMongo();
});

afterAll(async () => {
  await teardownMongo();
});
