import { Collection } from 'mongodb';
import type {
  NamespaceDocument,
  NamespaceInput,
  NamespaceMemberDocument,
  WithTimestamp,
} from '@sharedTypes/database/collection';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { NamespaceMemberDocumentSchema } from '@schema/database/namespace-member';
import { execute, TxContext, withTransaction } from '@database/client/mongo-client';
import { namespaceMemberCollectionBuilder } from '@database/collections/namespace-members';
import { namespaceCollectionBuilder } from '../collections/namespaces';
import { RepositoryNotFoundError, RepositoryResult, repositorySafe } from './util';

type NamespaceMemberPermissions = NamespaceMemberDocument['permissions'];

type NamespaceMemberParams = {
  namespaceId: string;
  userId: string;
};

type AddNamespaceMemberParams = NamespaceMemberParams & {
  permissions: NamespaceMemberPermissions;
};

type CheckPermissionsParmas = {
  namespaceId: string;
  userId: string;
};

type NamespaceRepositoryOptions = {
  mockCollectionBuilder?: (tx: TxContext) => Collection<WithTimestamp<NamespaceDocument>>;
  mockMemberCollectionBuilder?: (tx: TxContext) => Collection<WithTimestamp<NamespaceMemberDocument>>;
  mockDocumentSchema?: typeof NamespaceInputSchema;
  mockMemberDocumentSchema?: typeof NamespaceMemberDocumentSchema;
};

export class NamespaceRepository {
  private collectionBuilder: (tx: TxContext) => Collection<WithTimestamp<NamespaceDocument>>;
  private memberCollectionBuilder: (tx: TxContext) => Collection<WithTimestamp<NamespaceMemberDocument>>;
  private documentSchema: typeof NamespaceInputSchema;
  private memberDocumentSchema: typeof NamespaceMemberDocumentSchema;

  constructor({
    mockCollectionBuilder,
    mockMemberCollectionBuilder,
    mockDocumentSchema,
    mockMemberDocumentSchema,
  }: NamespaceRepositoryOptions = {}) {
    this.collectionBuilder = mockCollectionBuilder ?? namespaceCollectionBuilder;
    this.memberCollectionBuilder = mockMemberCollectionBuilder ?? namespaceMemberCollectionBuilder;
    this.documentSchema = mockDocumentSchema ?? NamespaceInputSchema;
    this.memberDocumentSchema = mockMemberDocumentSchema ?? NamespaceMemberDocumentSchema;
  }

  async get(id: string): Promise<RepositoryResult<NamespaceDocument>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const namespaces = this.collectionBuilder(tx);
        const namespace = await namespaces.findOne({ id }, this.getOperationOptions(tx));
        if (!namespace) throw new RepositoryNotFoundError();

        return namespace;
      });
    });
  }

  async create(namespace: NamespaceInput, userId: string): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      const document = this.documentSchema.parse(namespace);
      const member = this.memberDocumentSchema.parse({
        userId,
        namespaceId: namespace.id,
        permissions: this.createOwnerPermissions(),
      });
      const now = new Date();
      return await withTransaction(async (tx) => {
        const namespaces = this.collectionBuilder(tx);
        const members = this.memberCollectionBuilder(tx);
        const options = this.getOperationOptions(tx);

        await namespaces.insertOne({ ...document, createdBy: userId, createdAt: now, updatedAt: now }, options);
        await members.insertOne({ ...member, createdAt: now, updatedAt: now }, options);
      });
    });
  }

  async update(id: string, namespace: NamespaceInput): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const namespaces = this.collectionBuilder(tx);
        const options = this.getOperationOptions(tx);

        const parsedDocument = this.documentSchema.parse(namespace);
        const result = await namespaces.updateOne(
          { id },
          { $set: { ...parsedDocument, updatedAt: new Date() } },
          options
        );
        if (result.matchedCount === 0) throw new RepositoryNotFoundError();
        const members = this.memberCollectionBuilder(tx);
        await members.updateMany({ namespaceId: id }, { $set: { namespaceId: parsedDocument.id } }, options);
      });
    });
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      return await withTransaction(async (tx) => {
        const namespaces = this.collectionBuilder(tx);
        const members = this.memberCollectionBuilder(tx);
        const options = this.getOperationOptions(tx);
        const result = await namespaces.deleteOne({ id }, options);
        if (result.deletedCount === 0) throw new RepositoryNotFoundError();

        await members.deleteMany({ namespaceId: id }, options);
      });
    });
  }

  async addMember({ namespaceId, userId, permissions }: AddNamespaceMemberParams): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const members = this.memberCollectionBuilder(tx);
        const member = this.memberDocumentSchema.parse({ namespaceId, userId, permissions });
        const now = new Date();

        await members.insertOne({ ...member, createdAt: now, updatedAt: now }, this.getOperationOptions(tx));
      });
    });
  }

  async removeMember({ namespaceId, userId }: NamespaceMemberParams): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const members = this.memberCollectionBuilder(tx);
        const result = await members.deleteOne({ namespaceId, userId }, this.getOperationOptions(tx));
        if (result.deletedCount === 0) throw new RepositoryNotFoundError();
      });
    });
  }

  async isMember({ namespaceId, userId }: NamespaceMemberParams): Promise<RepositoryResult<boolean>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const members = this.memberCollectionBuilder(tx);
        const member = await members.findOne({ namespaceId, userId }, this.getOperationOptions(tx));

        return member !== null;
      });
    });
  }

  async findMembers(namespaceId: string): Promise<RepositoryResult<NamespaceMemberDocument[]>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const members = this.memberCollectionBuilder(tx);

        return await members.find({ namespaceId }, this.getOperationOptions(tx)).sort({ userId: 1 }).toArray();
      });
    });
  }

  async findNamespacesByUser(userId: string): Promise<RepositoryResult<NamespaceDocument[]>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const members = this.memberCollectionBuilder(tx);
        const namespaces = this.collectionBuilder(tx);
        const options = this.getOperationOptions(tx);
        const memberships = await members.find({ userId }, options).sort({ namespaceId: 1 }).toArray();
        const namespaceIds = memberships.map((membership) => membership.namespaceId);

        if (namespaceIds.length === 0) return [];

        return await namespaces
          .find({ id: { $in: namespaceIds } }, options)
          .sort({ id: 1 })
          .toArray();
      });
    });
  }

  async checkPermissions({ namespaceId, userId }: CheckPermissionsParmas) {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const members = this.memberCollectionBuilder(tx);
        const member = await members.findOne({ namespaceId, userId });
        if (!member) throw new RepositoryNotFoundError();
        return member.permissions;
      });
    });
  }

  private createOwnerPermissions(): NamespaceMemberPermissions {
    return {
      read: true,
      create: true,
      update: true,
      delete: true,
      admin: true,
    };
  }

  private getOperationOptions(tx: TxContext) {
    return tx.session ? { session: tx.session } : undefined;
  }
}
