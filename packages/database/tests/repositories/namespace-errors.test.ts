import { type Collection, MongoServerError } from 'mongodb';
import { execute } from '@database/client/mongo-client';
import { namespaceMemberCollectionBuilder } from '@database/collections/namespace-members';
import { namespaceCollectionBuilder } from '@database/collections/namespaces';
import { NamespaceRepository } from '@database/repositories/namespace';
import type { NamespaceDocument, NamespaceMemberDocument, WithTimestamp } from '@sharedTypes/database/collection';

const memberPermissions = {
  read: true,
  create: false,
  update: false,
  delete: false,
  admin: false,
};

function createNamespaceDocument({
  id,
  displayName,
  description,
  isPrivate,
  createdBy,
}: Partial<NamespaceDocument>): WithTimestamp<NamespaceDocument> {
  const now = new Date();

  return {
    id: id ?? 'sample',
    displayName: displayName ?? 'Sample',
    description: description ?? '',
    isPrivate: isPrivate ?? false,
    createdBy: createdBy ?? 'dummy-user',
    createdAt: now,
    updatedAt: now,
  };
}

function createMemberDocument(namespaceId: string, userId: string): WithTimestamp<NamespaceMemberDocument> {
  const now = new Date();

  return {
    namespaceId,
    userId,
    permissions: memberPermissions,
    createdAt: now,
    updatedAt: now,
  };
}

describe('namespace repository error mapping', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();

    await execute(async (tx) => {
      await namespaceMemberCollectionBuilder(tx).deleteMany({});
      await namespaceCollectionBuilder(tx).deleteMany({});
    });
  });

  describe('create', () => {
    it('maps namespace insert failure', async () => {
      const error = new MongoServerError({
        message: 'duplicate namespace',
      });
      error.code = 11000;
      const insertNamespace = vi.fn().mockRejectedValue(error);
      const insertMember = vi.fn().mockResolvedValue({ acknowledged: true, insertedId: 'member-id' });
      const repository = new NamespaceRepository({
        mockCollectionBuilder: () =>
          ({
            insertOne: insertNamespace,
          }) as unknown as Collection<WithTimestamp<NamespaceDocument>>,
        mockMemberCollectionBuilder: () =>
          ({
            insertOne: insertMember,
          }) as unknown as Collection<WithTimestamp<NamespaceMemberDocument>>,
      });

      const result = await repository.create(
        { id: 'sample', displayName: 'Sample', description: '', isPrivate: true },
        'dummy-user'
      );
      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('already_exists');
      expect(insertMember).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().get('missing');
      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });

  describe('update', () => {
    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().update('missing', {
        id: 'missing',
        displayName: 'missing',
        description: '',
        isPrivate: false,
        createdBy: 'dummy-user',
      });
      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });

  describe('delete', () => {
    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().delete('missing');

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });

  describe('addMember', () => {
    it('returns already_exists when duplicated', async () => {
      await execute(async (tx) => {
        await namespaceMemberCollectionBuilder(tx).insertOne(createMemberDocument('sample', 'member-user'));
      });

      const result = await new NamespaceRepository().addMember({
        namespaceId: 'sample',
        userId: 'member-user',
        permissions: memberPermissions,
      });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('already_exists');
    });
  });

  describe('removeMember', () => {
    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().removeMember({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });

  describe('checkPermissions', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertOne(
          createNamespaceDocument({ id: 'sample', displayName: 'Sample' }) as any
        );
      });
    });

    it('returns not_found when membership is missing', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });

    it('returns not_found when namespace is missing', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'missing',
        userId: 'owner-user',
      });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });
});
