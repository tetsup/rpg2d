import { Collection } from 'mongodb';
import type { NamespaceMemberDocument } from '@database/types/collection';
import type { TxContext } from '@database/client/mongo-client';

export function namespaceMemberCollectionBuilder(tx: TxContext): Collection<NamespaceMemberDocument> {
  return tx.db.collection<NamespaceMemberDocument>('namespace_members');
}
