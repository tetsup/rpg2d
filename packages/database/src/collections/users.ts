import type { UserDocument, WithTimestamp } from '@sharedTypes/database/collection';
import type { TxContext } from '@database/client/mongo-client';

export function userCollectionBuilder(tx: TxContext) {
  return tx.db.collection<WithTimestamp<UserDocument>>('users');
}
