import { Collection } from 'mongodb';
import type { UserDocument } from '@sharedTypes/database/collection';
import type { TxContext } from '@database/client/mongo-client';

export function userCollectionBuilder(tx: TxContext): Collection<UserDocument> {
  return tx.db.collection<UserDocument>('users');
}
