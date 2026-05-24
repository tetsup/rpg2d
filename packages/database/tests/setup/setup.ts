import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeAll, afterAll } from 'vitest';

let mongoServer: MongoMemoryServer;

export async function setupMongo() {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongoServer.getUri();
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
