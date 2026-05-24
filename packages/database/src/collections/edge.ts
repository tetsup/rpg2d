import { Collection } from 'mongodb';
import { getMongoDb } from '../client/mongo-client';
import { ResourceEdgeDocument } from '../schemas/edge';

export async function resourceEdgesCollection(): Promise<Collection<ResourceEdgeDocument>> {
  const db = await getMongoDb();
  return db.collection<ResourceEdgeDocument>('resource_edges');
}
