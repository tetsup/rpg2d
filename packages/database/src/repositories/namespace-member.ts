import { Collection } from 'mongodb';
import { execute, TxContext } from '@database/client/mongo-client';
import { NamespaceMemberDocument } from '@database/types/collection';
import { NamespaceMemberDocumentSchema } from '@database/schemas/namespace-member';
import { namespaceMemberCollectionBuilder } from '../collections/namespace-members';

type FindNamespaceMemberParams = { namespaceId: string; userId: string };

type UpsertNamespaceMemberParams = {
  namespaceId: string;
  userId: string;
  permissions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
};

type NamespaceMemberRepositoryOptions = {
  mockCollectionBuilder?: (tx: TxContext) => Collection<NamespaceMemberDocument>;
  mockDocumentSchema?: typeof NamespaceMemberDocumentSchema;
};

export class NamespaceMemberRepository {
  private collectionBuilder: (tx: TxContext) => Collection<NamespaceMemberDocument>;
  private documentSchema: typeof NamespaceMemberDocumentSchema;

  constructor({ mockCollectionBuilder, mockDocumentSchema }: NamespaceMemberRepositoryOptions = {}) {
    this.collectionBuilder = mockCollectionBuilder ?? namespaceMemberCollectionBuilder;
    this.documentSchema = mockDocumentSchema ?? NamespaceMemberDocumentSchema;
  }

  async get({ namespaceId, userId }: FindNamespaceMemberParams) {
    return await execute(async (tx) => {
      const members = this.collectionBuilder(tx);
      return members.findOne({ namespaceId, userId });
    });
  }

  async upsert({ namespaceId, userId, permissions }: UpsertNamespaceMemberParams) {
    return await execute(async (tx) => {
      const members = this.collectionBuilder(tx);
      const now = new Date();
      this.documentSchema.parse({ namespaceId, userId, permissions });
      return await members.updateOne(
        { namespaceId, userId },
        { $set: { permissions, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true }
      );
    });
  }
}
