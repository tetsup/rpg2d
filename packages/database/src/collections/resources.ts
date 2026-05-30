import { Collection } from 'mongodb';
import type { ResourceDocument } from '@database/types/collection';
import type { TxContext } from '@database/client/mongo-client';

export function resourceCollectionBuilder(tx: TxContext): Collection<ResourceDocument> {
  return tx.db.collection<ResourceDocument>('resources');
}
