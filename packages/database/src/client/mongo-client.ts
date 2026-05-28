import { ClientSession, Db, MongoClient } from 'mongodb';

const dbName = process.env.MONGO_DB ?? 'rpg2d';

let client: MongoClient | null = null;
let db: Db | null = null;

export type ConnectionSet = {
  client: MongoClient;
  db: Db;
};

export type TxContext = {
  db: Db;
  session?: ClientSession;
};

async function createMongoClient(): Promise<ConnectionSet> {
  const url = process.env.MONGO_URL!;
  const client = new MongoClient(url);
  await client.connect();
  return {
    client,
    db: client.db(dbName),
  };
}

async function forceCloseConnection() {
  try {
    await client?.close();
  } catch {
    // ignore
  }
  client = null;
  db = null;
}

async function ensureConnection(): Promise<ConnectionSet> {
  try {
    if (client && db) {
      await db.command({ ping: 1 });
      return { client, db };
    }
  } catch {
    await forceCloseConnection();
  }
  const connection = await createMongoClient();
  client = connection.client;
  db = connection.db;
  return connection;
}

export async function execute<T>(func: (ctx: TxContext) => Promise<T>): Promise<T> {
  const { db } = await ensureConnection();
  return await func({ db });
}

export async function withTransaction<T>(func: (ctx: TxContext) => Promise<T>): Promise<T> {
  const { client, db } = await ensureConnection();
  return client.withSession((session) => session.withTransaction(async () => await func({ db, session })));
}
