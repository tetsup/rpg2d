import { Collection } from 'mongodb';
import type { NamespaceDocument } from '@sharedTypes/database/collection';
import { TxContext } from '@database/client/mongo-client';

export function namespaceCollectionBuilder(tx: TxContext): Collection<NamespaceDocument> {
  return tx.db.collection<NamespaceDocument>('namespaces');
}
