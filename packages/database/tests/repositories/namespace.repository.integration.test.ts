import { execute } from '@database/client/mongo-client';
import { namespaceMemberCollectionBuilder } from '@database/collections/namespace-members';
import { namespaceCollectionBuilder } from '@database/collections/namespaces';
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

function createNamespaceDocument(id: string, displayName = id, createdBy = 'owner-user'): NamespaceDocument {
  const now = new Date();

  return {
    id,
    displayName,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
}

function createMemberDocument(namespaceId: string, userId: string): NamespaceMemberDocument {
  const now = new Date();

  return {
    namespaceId,
    userId,
    permissions: memberPermissions,
    createdAt: now,
    updatedAt: now,
  };
}

function createOwnerMemberDocument(namespaceId: string, userId: string): NamespaceMemberDocument {
  const now = new Date();

  return {
    namespaceId,
    userId,
    permissions: ownerPermissions,
    createdAt: now,
    updatedAt: now,
  };
}

describe('namespace repository integration', () => {
  beforeEach(async () => {
    await execute(async (tx) => {
      await namespaceMemberCollectionBuilder(tx).deleteMany({});
      await namespaceCollectionBuilder(tx).deleteMany({});
    });
  });

  describe('create', () => {
    it('creates namespace', async () => {
      const result = await new NamespaceRepository().create({
        id: 'sample',
        displayName: 'Sample',
        createdBy: 'owner-user',
      });

      expect(result.ok).toBeTruthy();

      const namespace = await execute(async (tx) => {
        return await namespaceCollectionBuilder(tx).findOne({ id: 'sample' });
      });

      expect(namespace?.displayName).toBe('Sample');
      expect(namespace?.createdBy).toBe('owner-user');
    });

    it('creates owner membership', async () => {
      const result = await new NamespaceRepository().create({
        id: 'sample',
        displayName: 'Sample',
        createdBy: 'owner-user',
      });

      expect(result.ok).toBeTruthy();

      const member = await execute(async (tx) => {
        return await namespaceMemberCollectionBuilder(tx).findOne({
          namespaceId: 'sample',
          userId: 'owner-user',
        });
      });

      expect(member?.permissions).toEqual(ownerPermissions);
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertOne(createNamespaceDocument('sample', 'Sample'));
      });
    });

    it('returns existing namespace', async () => {
      const result = await new NamespaceRepository().get('sample');

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.displayName).toBe('Sample');
      }
    });

    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().get('missing');

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertOne(createNamespaceDocument('sample', 'Sample'));
      });
    });

    it('updates displayName', async () => {
      const result = await new NamespaceRepository().update({
        id: 'sample',
        displayName: 'Updated Sample',
      });

      expect(result.ok).toBeTruthy();

      const namespace = await execute(async (tx) => {
        return await namespaceCollectionBuilder(tx).findOne({ id: 'sample' });
      });

      expect(namespace?.displayName).toBe('Updated Sample');
      expect(namespace?.createdBy).toBe('owner-user');
    });

    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().update({
        id: 'missing',
        displayName: 'Missing',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertOne(createNamespaceDocument('sample', 'Sample'));
        await namespaceMemberCollectionBuilder(tx).insertMany([
          createMemberDocument('sample', 'owner-user'),
          createMemberDocument('sample', 'member-user'),
        ]);
      });
    });

    it('deletes namespace', async () => {
      const result = await new NamespaceRepository().delete('sample');

      expect(result.ok).toBeTruthy();

      const namespace = await execute(async (tx) => {
        return await namespaceCollectionBuilder(tx).findOne({ id: 'sample' });
      });

      expect(namespace).toBeNull();
    });

    it('deletes memberships', async () => {
      const result = await new NamespaceRepository().delete('sample');

      expect(result.ok).toBeTruthy();

      const members = await execute(async (tx) => {
        return await namespaceMemberCollectionBuilder(tx).find({ namespaceId: 'sample' }).toArray();
      });

      expect(members).toHaveLength(0);
    });

    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().delete('missing');

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });
  });

  describe('addMember', () => {
    it('adds member', async () => {
      const result = await new NamespaceRepository().addMember({
        namespaceId: 'sample',
        userId: 'member-user',
        permissions: memberPermissions,
      });

      expect(result.ok).toBeTruthy();

      const member = await execute(async (tx) => {
        return await namespaceMemberCollectionBuilder(tx).findOne({
          namespaceId: 'sample',
          userId: 'member-user',
        });
      });

      expect(member?.permissions).toEqual(memberPermissions);
    });

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

      if (!result.ok) {
        expect(result.reason).toBe('already_exists');
      }
    });
  });

  describe('removeMember', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceMemberCollectionBuilder(tx).insertOne(createMemberDocument('sample', 'member-user'));
      });
    });

    it('removes member', async () => {
      const result = await new NamespaceRepository().removeMember({
        namespaceId: 'sample',
        userId: 'member-user',
      });

      expect(result.ok).toBeTruthy();

      const member = await execute(async (tx) => {
        return await namespaceMemberCollectionBuilder(tx).findOne({
          namespaceId: 'sample',
          userId: 'member-user',
        });
      });

      expect(member).toBeNull();
    });

    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().removeMember({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });
  });

  describe('isMember', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceMemberCollectionBuilder(tx).insertOne(createMemberDocument('sample', 'member-user'));
      });
    });

    it('returns true for member', async () => {
      const result = await new NamespaceRepository().isMember({
        namespaceId: 'sample',
        userId: 'member-user',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toBe(true);
      }
    });

    it('returns false for non-member', async () => {
      const result = await new NamespaceRepository().isMember({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toBe(false);
      }
    });
  });

  describe('checkPermissions', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertOne(createNamespaceDocument('sample', 'Sample'));
        await namespaceMemberCollectionBuilder(tx).insertMany([
          createOwnerMemberDocument('sample', 'owner-user'),
          createMemberDocument('sample', 'member-user'),
        ]);
      });
    });

    it('returns owner permissions', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'sample',
        userId: 'owner-user',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual(ownerPermissions);
      }
    });

    it('returns member permissions', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'sample',
        userId: 'member-user',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual(memberPermissions);
      }
    });

    it('returns not_found when membership is missing', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });

    it('returns not_found when namespace is missing', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'missing',
        userId: 'owner-user',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });
  });

  describe('findMembers', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceMemberCollectionBuilder(tx).insertMany([
          createMemberDocument('sample', 'user-b'),
          createMemberDocument('sample', 'user-a'),
          createMemberDocument('other', 'user-c'),
        ]);
      });
    });

    it('returns members', async () => {
      const result = await new NamespaceRepository().findMembers('sample');

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.map((member) => member.userId)).toEqual(['user-a', 'user-b']);
      }
    });
  });

  describe('findNamespacesByUser', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertMany([
          createNamespaceDocument('namespace-b', 'Namespace B'),
          createNamespaceDocument('namespace-a', 'Namespace A'),
          createNamespaceDocument('namespace-c', 'Namespace C'),
        ]);
        await namespaceMemberCollectionBuilder(tx).insertMany([
          createMemberDocument('namespace-b', 'member-user'),
          createMemberDocument('namespace-a', 'member-user'),
          createMemberDocument('namespace-c', 'other-user'),
        ]);
      });
    });

    it('returns namespaces for user memberships', async () => {
      const result = await new NamespaceRepository().findNamespacesByUser('member-user');

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.map((namespace) => namespace.id)).toEqual(['namespace-a', 'namespace-b']);
      }
    });
  });
});
