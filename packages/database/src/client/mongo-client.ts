import { Db, MongoClient } from 'mongodb';

let db: Db | null = null;
let client: MongoClient | null = null;

export async function connectMongo() {
  if (db) return db;

  const url = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DB ?? 'rpg_editor';
  client = new MongoClient(url);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function getMongoDb() {
  return connectMongo();
}

export async function disconnectMongo() {
  await client?.close();
  client = null;
  db = null;
}
