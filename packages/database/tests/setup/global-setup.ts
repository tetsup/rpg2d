import { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async function () {
  const mongoServer = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      storageEngine: 'wiredTiger',
    },
  });

  process.env.MONGO_URL = mongoServer.getUri();

  return async () => {
    await mongoServer.stop();
  };
}
