import type { Collection } from 'mongodb';
import { MongoServerError } from 'mongodb';
import { NamespaceRepository } from '@database/repositories/namespace';
import type { NamespaceDocument, NamespaceMemberDocument } from '@database/types/collection';

const ownerPermissions = {
  read: true,
  create: true,
  update: true,
  delete: true,
  admin: true,
};

const memberPermissions = {
  read: true,
  create: false,
  update: false,
  delete: false,
  admin: false,
};

describe('namespace repository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
          }) as unknown as Collection<NamespaceDocument>,
        mockMemberCollectionBuilder: () =>
          ({
            insertOne: insertMember,
          }) as unknown as Collection<NamespaceMemberDocument>,
      });

      const result = await repository.create({
        id: 'sample',
        displayName: 'Sample',
        createdBy: 'owner-user',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('already_exists');
      }

      expect(insertMember).not.toHaveBeenCalled();
    });
  });

  describe('checkPermissions', () => {
    it('returns owner permissions', async () => {
      const findOne = vi.fn().mockResolvedValue({
        namespaceId: 'sample',
        userId: 'owner-user',
        permissions: ownerPermissions,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const repository = new NamespaceRepository({
        mockMemberCollectionBuilder: () =>
          ({
            findOne,
          }) as unknown as Collection<NamespaceMemberDocument>,
      });

      const result = await repository.checkPermissions({
        namespaceId: 'sample',
        userId: 'owner-user',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual(ownerPermissions);
      }

      expect(findOne).toHaveBeenCalledWith({
        namespaceId: 'sample',
        userId: 'owner-user',
      });
    });

    it('returns member permissions', async () => {
      const findOne = vi.fn().mockResolvedValue({
        namespaceId: 'sample',
        userId: 'member-user',
        permissions: memberPermissions,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const repository = new NamespaceRepository({
        mockMemberCollectionBuilder: () =>
          ({
            findOne,
          }) as unknown as Collection<NamespaceMemberDocument>,
      });

      const result = await repository.checkPermissions({
        namespaceId: 'sample',
        userId: 'member-user',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual(memberPermissions);
      }
    });

    it('returns not_found when membership is missing', async () => {
      const repository = new NamespaceRepository({
        mockMemberCollectionBuilder: () =>
          ({
            findOne: vi.fn().mockResolvedValue(null),
          }) as unknown as Collection<NamespaceMemberDocument>,
      });

      const result = await repository.checkPermissions({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });

    it('returns not_found when namespace is missing', async () => {
      const repository = new NamespaceRepository({
        mockMemberCollectionBuilder: () =>
          ({
            findOne: vi.fn().mockResolvedValue(null),
          }) as unknown as Collection<NamespaceMemberDocument>,
      });

      const result = await repository.checkPermissions({
        namespaceId: 'missing',
        userId: 'owner-user',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });
  });
});
