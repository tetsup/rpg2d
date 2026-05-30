import { execute, TxContext } from '@database/client/mongo-client';
import { namespaceCollectionBuilder } from '../collections/namespaces';
import { Collection } from 'mongodb';
import { NamespaceDocument } from '@database/types/collection';
import { NamespaceDocumentSchema } from '@database/schemas/namespace';

type CreateNamespaceParams = {
  id: string;
  displayName: string;
  createdBy: string;
};

type NamespaceRepositoryOptions = {
  mockCollectionBuilder?: (tx: TxContext) => Collection<NamespaceDocument>;
  mockDocumentSchema?: typeof NamespaceDocumentSchema;
};

export class NamespaceRepository {
  private collectionBuilder: (tx: TxContext) => Collection<NamespaceDocument>;
  private documentSchema: typeof NamespaceDocumentSchema;

  constructor({ mockCollectionBuilder, mockDocumentSchema }: NamespaceRepositoryOptions = {}) {
    this.collectionBuilder = mockCollectionBuilder ?? namespaceCollectionBuilder;
    this.documentSchema = mockDocumentSchema ?? NamespaceDocumentSchema;
  }

  async findNamespaceById(id: string) {
    return await execute(async (tx) => {
      const namespaces = this.collectionBuilder(tx);
      return await namespaces.findOne({
        id,
      });
    });
  }

  async createNamespace({ id, displayName, createdBy }: CreateNamespaceParams) {
    return await execute(async (tx) => {
      const namespaces = this.collectionBuilder(tx);
      const document = this.documentSchema.parse({ id, displayName, createdBy });
      const now = new Date();
      return await namespaces.insertOne({ ...document, createdAt: now, updatedAt: now });
    });
  }
}
