import { Collection } from 'mongodb';
import type { ResourceDocument } from '@sharedTypes/database/collection';
import type { TxContext } from '@database/client/mongo-client';

export function resourceCollectionBuilder(tx: TxContext): Collection<ResourceDocument> {
  return tx.db.collection<ResourceDocument>('resources');
}
