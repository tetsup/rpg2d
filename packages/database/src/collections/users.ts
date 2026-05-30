import { Collection } from 'mongodb';
import type { UserDocument } from '@database/types/collection';
import type { TxContext } from '@database/client/mongo-client';

export function userCollectionBuilder(tx: TxContext): Collection<UserDocument> {
  return tx.db.collection<UserDocument>('users');
}
