import { execute, TxContext, withTransaction } from '@database/client/mongo-client';
import { namespaceCollectionBuilder } from '../collections/namespaces';
import { Collection } from 'mongodb';
import { NamespaceDocument, NamespaceMemberDocument } from '@database/types/collection';
import { NamespaceDocumentSchema } from '@database/schemas/namespace';
import { namespaceMemberCollectionBuilder } from '@database/collections/namespace-members';
import { NamespaceMemberDocumentSchema } from '@database/schemas/namespace-member';
import { RepositoryNotFoundError, RepositoryResult, repositorySafe } from './util';

type CreateNamespaceParams = {
  id: string;
  displayName: string;
  createdBy: string;
};

type UpdateNamespaceParams = {
  id: string;
  displayName: string;
};

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

  async create({ id, displayName, createdBy }: CreateNamespaceParams): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      return await withTransaction(async (tx) => {
        const namespaces = this.collectionBuilder(tx);
        const members = this.memberCollectionBuilder(tx);
        const document = this.documentSchema.parse({ id, displayName, createdBy });
        const member = this.memberDocumentSchema.parse({
          namespaceId: id,
          userId: createdBy,
          permissions: this.createOwnerPermissions(),
        });
        const now = new Date();
        const options = this.getOperationOptions(tx);

        await namespaces.insertOne({ ...document, createdAt: now, updatedAt: now }, options);
        await members.insertOne({ ...member, createdAt: now, updatedAt: now }, options);
      });
    });
  }

  async update({ id, displayName }: UpdateNamespaceParams): Promise<RepositoryResult<void>> {
    return await repositorySafe(async () => {
      return await execute(async (tx) => {
        const namespaces = this.collectionBuilder(tx);
        const options = this.getOperationOptions(tx);
        const current = await namespaces.findOne({ id }, options);
        if (!current) throw new RepositoryNotFoundError();

        const document = this.documentSchema.parse({
          id,
          displayName,
          createdBy: current.createdBy,
        });
        const result = await namespaces.updateOne(
          { id },
          { $set: { displayName: document.displayName, updatedAt: new Date() } },
          options
        );
        if (result.matchedCount === 0) throw new RepositoryNotFoundError();
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
