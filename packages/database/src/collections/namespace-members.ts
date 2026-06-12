import type { NamespaceMemberDocument, WithTimestamp } from '@sharedTypes/database/collection';
import type { TxContext } from '@database/client/mongo-client';

export function namespaceMemberCollectionBuilder(tx: TxContext) {
  return tx.db.collection<WithTimestamp<NamespaceMemberDocument>>('namespace_members');
}
