import type { ResourceDocument, WithTimestamp } from '@sharedTypes/database/collection';
import type { TxContext } from '@database/client/mongo-client';

export function resourceCollectionBuilder(tx: TxContext) {
  return tx.db.collection<WithTimestamp<ResourceDocument>>('resources');
}
