import type { ResourceEdgeDocument } from '@sharedTypes/database/collection';
import type { TxContext } from '@database/client/mongo-client';

export function resourceEdgeCollectionBuilder(tx: TxContext) {
  return tx.db.collection<ResourceEdgeDocument>('resource_edges');
}
