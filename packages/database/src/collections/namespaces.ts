import { Collection } from 'mongodb';
import { TxContext } from '@database/client/mongo-client';
import type { NamespaceDocument } from '@database/types/collection';

export function namespaceCollectionBuilder(tx: TxContext): Collection<NamespaceDocument> {
  return tx.db.collection<NamespaceDocument>('namespaces');
}
