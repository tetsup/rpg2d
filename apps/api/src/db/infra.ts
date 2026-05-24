import { Db, MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

const client = new MongoClient(uri);

await client.connect();

export const db: Db = client.db(process.env.MONGODB_NAME!);
