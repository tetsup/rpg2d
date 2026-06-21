import type { NamespaceDocument, NamespaceMemberDocument, WithTimestamp } from '@sharedTypes/database/collection';
import { execute } from '@database/client/mongo-client';
import { namespaceMemberCollectionBuilder } from '@database/collections/namespace-members';
import { namespaceCollectionBuilder } from '@database/collections/namespaces';
import { NamespaceRepository } from '@database/repositories/namespace';

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

function createOwnerMemberDocument(namespaceId: string, userId: string): WithTimestamp<NamespaceMemberDocument> {
  const now = new Date();

  return {
    namespaceId,
    userId,
    permissions: ownerPermissions,
    createdAt: now,
    updatedAt: now,
  };
}

describe('namespace repository', () => {
  beforeEach(async () => {
    await execute(async (tx) => {
      await namespaceMemberCollectionBuilder(tx).deleteMany({});
      await namespaceCollectionBuilder(tx).deleteMany({});
    });
  });

  describe('create', () => {
    it('creates namespace', async () => {
      const result = await new NamespaceRepository().create(
        {
          id: 'sample',
          displayName: 'Sample',
          description: '',
          isPrivate: true,
        },
        'owner-user'
      );

      expect(result.ok).toBeTruthy();

      const namespace = await execute(async (tx) => {
        return await namespaceCollectionBuilder(tx).findOne({ id: 'sample' });
      });

      expect(namespace?.displayName).toBe('Sample');
      expect(namespace?.createdBy).toBe('owner-user');
    });

    it('creates owner membership', async () => {
      const result = await new NamespaceRepository().create(
        {
          id: 'sample',
          displayName: 'Sample',
          description: '',
          isPrivate: true,
        },
        'owner-user'
      );

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
        await namespaceCollectionBuilder(tx).insertOne(
          createNamespaceDocument({ id: 'sample', displayName: 'Sample' })
        );
      });
    });

    it('returns existing namespace', async () => {
      const result = await new NamespaceRepository().get('sample');

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data.displayName).toBe('Sample');
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertOne(
          createNamespaceDocument({ id: 'sample', displayName: 'Sample' })
        );
      });
    });

    it('updates displayName', async () => {
      const result = await new NamespaceRepository().update('sample', {
        id: 'sample',
        displayName: 'Updated Sample',
        description: '',
        isPrivate: false,
      });

      expect(result.ok).toBeTruthy();

      const namespace = await execute(async (tx) => {
        return await namespaceCollectionBuilder(tx).findOne({ id: 'sample' });
      });

      expect(namespace?.displayName).toBe('Updated Sample');
      expect(namespace?.createdBy).toBe('dummy-user');
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertOne(
          createNamespaceDocument({ id: 'sample', displayName: 'Sample' })
        );
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
      expect(result.ok && result.data).toBe(true);
    });

    it('returns false for non-member', async () => {
      const result = await new NamespaceRepository().isMember({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toBe(false);
    });
  });

  describe('checkPermissions', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertOne(
          createNamespaceDocument({ id: 'sample', displayName: 'Sample' })
        );
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
      expect(result.ok && result.data).toEqual(ownerPermissions);
    });

    it('returns member permissions', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'sample',
        userId: 'member-user',
      });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toEqual(memberPermissions);
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
      expect(result.ok && result.data.map((member) => member.userId)).toEqual(['user-a', 'user-b']);
    });
  });

  describe('find', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertMany([
          createNamespaceDocument({
            id: 'namespace-b',
            displayName: 'Namespace B',
            createdBy: 'member-user',
            isPrivate: true,
          }),
          createNamespaceDocument({
            id: 'namespace-a',
            displayName: 'Namespace A',
            createdBy: 'other-user',
            isPrivate: false,
          }),
          createNamespaceDocument({
            id: 'namespace-c',
            displayName: 'Namespace C',
            createdBy: 'other-user',
            isPrivate: true,
          }),
        ]);

        await namespaceMemberCollectionBuilder(tx).insertMany([
          createMemberDocument('namespace-b', 'member-user'),
          createMemberDocument('namespace-a', 'other-user'),
          createMemberDocument('namespace-c', 'other-user'),
        ]);
      });
    });

    it('returns namespaces either for user memberships or public', async () => {
      const result = await new NamespaceRepository().find({}, 'member-user');

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data.map((namespace) => namespace.id)).toEqual(['namespace-a', 'namespace-b']);
    });

    it('returns public namespaces even when user has no memberships', async () => {
      const result = await new NamespaceRepository().find({}, 'no-membership-user');

      expect(result.ok).toBeTruthy();

      expect(result.ok && result.data.map((namespace) => namespace.id)).toEqual(['namespace-a']);
    });

    it('applies query filter', async () => {
      const result = await new NamespaceRepository().find(
        {
          displayName: {
            eq: 'Namespace A',
          },
        },
        'member-user'
      );

      expect(result.ok).toBeTruthy();

      expect(result.ok && result.data.map((namespace) => namespace.id)).toEqual(['namespace-a']);
    });

    it('applies limit', async () => {
      const result = await new NamespaceRepository().find({}, 'member-user', 1);

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toHaveLength(1);
      expect(result.ok && result.data[0]?.id).toBe('namespace-a');
    });
  });

  describe('findWithCursor', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await namespaceCollectionBuilder(tx).insertMany([
          createNamespaceDocument({
            id: 'namespace-a',
            displayName: 'Namespace A',
            createdBy: 'member-user',
            isPrivate: true,
          }),
          createNamespaceDocument({
            id: 'namespace-b',
            displayName: 'Namespace B',
            createdBy: 'member-user',
            isPrivate: true,
          }),
          createNamespaceDocument({
            id: 'namespace-c',
            displayName: 'Namespace C',
            createdBy: 'member-user',
            isPrivate: true,
          }),
        ]);

        await namespaceMemberCollectionBuilder(tx).insertMany([
          createMemberDocument('namespace-a', 'member-user'),
          createMemberDocument('namespace-b', 'member-user'),
          createMemberDocument('namespace-c', 'member-user'),
        ]);
      });
    });

    it('returns items after cursor', async () => {
      const result = await new NamespaceRepository().findWithCursor({}, 'member-user', 'namespace-a', 10);

      expect(result.ok).toBeTruthy();

      expect(result.ok && result.data.items.map((namespace) => namespace.id)).toEqual(['namespace-b', 'namespace-c']);
    });

    it('returns hasMore true when more items exist after current page', async () => {
      const result = await new NamespaceRepository().findWithCursor({}, 'member-user', undefined, 2);

      expect(result.ok).toBeTruthy();

      expect(result.ok && result.data.items.map((namespace) => namespace.id)).toEqual(['namespace-a', 'namespace-b']);

      expect(result.ok && result.data.hasMore).toBe(true);
      expect(result.ok && result.data.hasMore && result.data.nextCursor).toBe('namespace-b');
    });

    it('returns hasMore false when total count equals limit', async () => {
      const result = await new NamespaceRepository().findWithCursor({}, 'member-user', undefined, 3);

      expect(result.ok).toBeTruthy();

      expect(result.ok && result.data.items.map((namespace) => namespace.id)).toEqual([
        'namespace-a',
        'namespace-b',
        'namespace-c',
      ]);

      expect(result.ok && result.data.hasMore).toBe(false);
      expect(result.ok && 'nextCursor' in result.data).toBe(false);
    });

    it('returns hasMore false when result count is less than limit', async () => {
      const result = await new NamespaceRepository().findWithCursor({}, 'member-user', 'namespace-b', 10);

      expect(result.ok).toBeTruthy();

      expect(result.ok && result.data.items.map((namespace) => namespace.id)).toEqual(['namespace-c']);

      expect(result.ok && result.data.hasMore).toBe(false);
    });
  });
});
