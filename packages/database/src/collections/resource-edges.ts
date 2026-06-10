import { Collection } from 'mongodb';
import type { ResourceEdgeDocument } from '@sharedTypes/database/collection';
import type { TxContext } from '@database/client/mongo-client';

export function resourceEdgeCollectionBuilder(tx: TxContext): Collection<ResourceEdgeDocument> {
  return tx.db.collection<ResourceEdgeDocument>('resource_edges');
}
