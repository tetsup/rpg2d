import { execute, TxContext } from '@database/client/mongo-client';
import { namespaceCollectionBuilder } from '../collections/namespaces';
import { Collection } from 'mongodb';
import { NamespaceDocument, NamespaceMemberDocument } from '@database/types/collection';
import { NamespaceDocumentSchema } from '@database/schemas/namespace';
import { namespaceMemberCollectionBuilder } from '@database/collections/namespace-members';
import { NamespaceMemberDocumentSchema } from '@database/schemas/namespace-member';
import { repositorySafe } from './util';

type CreateNamespaceParams = {
  id: string;
  displayName: string;
  createdBy: string;
};

type NamespaceRepositoryOptions = {
  mockCollectionBuilder?: (tx: TxContext) => Collection<NamespaceDocument>;
  mockMemberCollectionBuilder?: (tx: TxContext) => Collection<NamespaceMemberDocument>;
  mockDocumentSchema?: typeof NamespaceDocumentSchema;
  mockMemberDocumentSchema?: typeof NamespaceMemberDocumentSchema;
};

export class NamespaceRepository {
  private collectionBuilder: (tx: TxContext) => Collection<NamespaceDocument>;
  private memberCollectionBuilder: (tx: TxContext) => Collection<NamespaceMemberDocument>;
  private documentSchema: typeof NamespaceDocumentSchema;
  private memberDocumentSchema: typeof NamespaceMemberDocumentSchema;

  constructor({
    mockCollectionBuilder,
    mockMemberCollectionBuilder,
    mockDocumentSchema,
    mockMemberDocumentSchema,
  }: NamespaceRepositoryOptions = {}) {
    this.collectionBuilder = mockCollectionBuilder ?? namespaceCollectionBuilder;
    this.memberCollectionBuilder = mockMemberCollectionBuilder ?? namespaceMemberCollectionBuilder;
    this.documentSchema = mockDocumentSchema ?? NamespaceDocumentSchema;
    this.memberDocumentSchema = mockMemberDocumentSchema ?? NamespaceMemberDocumentSchema;
  }

  async get(id: string) {
    return await execute(async (tx) => {
      return await repositorySafe(async () => {
        const namespaces = this.collectionBuilder(tx);
        return await namespaces.findOne({
          id,
        });
      });
    });
  }

  async create({ id, displayName, createdBy }: CreateNamespaceParams) {
    return await execute(async (tx) => {
      return await repositorySafe(async () => {
        const namespaces = this.collectionBuilder(tx);
        const document = this.documentSchema.parse({ id, displayName, createdBy });
        const now = new Date();
        return await namespaces.insertOne({ ...document, createdAt: now, updatedAt: now });
      });
    });
  }
}
