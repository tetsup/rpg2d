import type { NamespaceDocument, WithTimestamp } from '@sharedTypes/database/collection';
import { TxContext } from '@database/client/mongo-client';

export function namespaceCollectionBuilder(tx: TxContext) {
  return tx.db.collection<WithTimestamp<NamespaceDocument>>('namespaces');
}
