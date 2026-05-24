import { Collection } from 'mongodb';
import { getMongoDb } from '../client/mongo-client';
import { ResourceDocument } from '../schemas/resource';

export async function resourcesCollection(): Promise<Collection<ResourceDocument>> {
  const db = await getMongoDb();
  return db.collection<ResourceDocument>('resources');
}
