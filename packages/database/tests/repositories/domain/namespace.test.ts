import { execute } from '@database/client/pg-client';
import { NamespaceRepository } from '@database/repositories/namespace';
import { clearTables } from './helpers/db';
import {
  insertNamespace,
  insertPermission,
  insertUser,
  memberPermission,
  ownerPermission,
} from './helpers/fixtures';

describe('namespace repository', () => {
  beforeEach(async () => {
    await clearTables();
  });

  describe('create', () => {
    it('creates namespace', async () => {
      await insertUser({ id: 'owner-user' });

      const result = await new NamespaceRepository().create(
        {
          id: 'sample',
          presenceName: 'Sample',
          description: '',
          isPrivate: true,
        },
        'owner-user'
      );

      expect(result.ok).toBeTruthy();

      const namespace = await execute(async (db) => {
        return await db.selectFrom('namespaces').selectAll().where('id', '=', 'sample').executeTakeFirst();
      });

      expect(namespace?.presenceName).toBe('Sample');
      expect(namespace?.createdBy).toBe('owner-user');
    });

    it('creates owner membership', async () => {
      await insertUser({ id: 'owner-user' });

      const result = await new NamespaceRepository().create(
        {
          id: 'sample',
          presenceName: 'Sample',
          description: '',
          isPrivate: true,
        },
        'owner-user'
      );

      expect(result.ok).toBeTruthy();

      const member = await execute(async (db) => {
        return await db
          .selectFrom('namespace_permissions')
          .selectAll()
          .where('namespaceId', '=', 'sample')
          .where('userId', '=', 'owner-user')
          .executeTakeFirst();
      });

      expect(member?.permission).toBe(ownerPermission);
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample', presenceName: 'Sample' });
    });

    it('returns existing namespace', async () => {
      const result = await new NamespaceRepository().get('sample');

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data.presenceName).toBe('Sample');
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample', presenceName: 'Sample' });
    });

    it('updates presenceName', async () => {
      const result = await new NamespaceRepository().update('sample', {
        id: 'sample',
        presenceName: 'Updated Sample',
        description: '',
        isPrivate: false,
      });

      expect(result.ok).toBeTruthy();

      const namespace = await execute(async (db) => {
        return await db.selectFrom('namespaces').selectAll().where('id', '=', 'sample').executeTakeFirst();
      });

      expect(namespace?.presenceName).toBe('Updated Sample');
      expect(namespace?.createdBy).toBe('dummy-user');
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample', presenceName: 'Sample' });
      await insertUser({ id: 'owner-user' });
      await insertUser({ id: 'member-user' });
      await insertPermission('sample', 'owner-user', ownerPermission);
      await insertPermission('sample', 'member-user', memberPermission);
    });

    it('deletes namespace', async () => {
      const result = await new NamespaceRepository().delete('sample');

      expect(result.ok).toBeTruthy();

      const namespace = await execute(async (db) => {
        return await db.selectFrom('namespaces').selectAll().where('id', '=', 'sample').executeTakeFirst();
      });

      expect(namespace).toBeUndefined();
    });

    it('deletes memberships', async () => {
      const result = await new NamespaceRepository().delete('sample');

      expect(result.ok).toBeTruthy();

      const members = await execute(async (db) => {
        return await db
          .selectFrom('namespace_permissions')
          .selectAll()
          .where('namespaceId', '=', 'sample')
          .execute();
      });

      expect(members).toHaveLength(0);
    });
  });

  describe('addPermission', () => {
    it('adds member', async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertUser({ id: 'member-user' });

      const result = await new NamespaceRepository().addPermission({
        namespaceId: 'sample',
        userId: 'member-user',
        permission: memberPermission,
      });

      expect(result.ok).toBeTruthy();

      const member = await execute(async (db) => {
        return await db
          .selectFrom('namespace_permissions')
          .selectAll()
          .where('namespaceId', '=', 'sample')
          .where('userId', '=', 'member-user')
          .executeTakeFirst();
      });

      expect(member?.permission).toBe(memberPermission);
    });
  });

  describe('removePermission', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertUser({ id: 'member-user' });
      await insertPermission('sample', 'member-user', memberPermission);
    });

    it('removes member', async () => {
      const result = await new NamespaceRepository().removePermission({
        namespaceId: 'sample',
        userId: 'member-user',
      });

      expect(result.ok).toBeTruthy();

      const member = await execute(async (db) => {
        return await db
          .selectFrom('namespace_permissions')
          .selectAll()
          .where('namespaceId', '=', 'sample')
          .where('userId', '=', 'member-user')
          .executeTakeFirst();
      });

      expect(member).toBeUndefined();
    });
  });

  describe('isMember', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertUser({ id: 'member-user' });
      await insertPermission('sample', 'member-user', memberPermission);
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
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample', presenceName: 'Sample' });
      await insertUser({ id: 'owner-user' });
      await insertUser({ id: 'member-user' });
      await insertPermission('sample', 'owner-user', ownerPermission);
      await insertPermission('sample', 'member-user', memberPermission);
    });

    it('returns owner permissions', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'sample',
        userId: 'owner-user',
      });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toEqual([ownerPermission]);
    });

    it('returns member permissions', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'sample',
        userId: 'member-user',
      });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toEqual([memberPermission]);
    });
  });

  describe('findPermissions', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertNamespace({ id: 'other' });
      await insertUser({ id: 'user-b' });
      await insertUser({ id: 'user-a' });
      await insertUser({ id: 'user-c' });
      await insertPermission('sample', 'user-b', memberPermission);
      await insertPermission('sample', 'user-a', memberPermission);
      await insertPermission('other', 'user-c', memberPermission);
    });

    it('returns members', async () => {
      const result = await new NamespaceRepository().findPermissions('sample');

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data.map((member) => member.userId)).toEqual(['user-a', 'user-b']);
    });
  });

  describe('find', () => {
    beforeEach(async () => {
      await insertUser({ id: 'member-user' });
      await insertUser({ id: 'other-user' });

      await insertNamespace({
        id: 'namespace-b',
        presenceName: 'Namespace B',
        createdBy: 'member-user',
        isPrivate: true,
      });
      await insertNamespace({
        id: 'namespace-a',
        presenceName: 'Namespace A',
        createdBy: 'other-user',
        isPrivate: false,
      });
      await insertNamespace({
        id: 'namespace-c',
        presenceName: 'Namespace C',
        createdBy: 'other-user',
        isPrivate: true,
      });

      await insertPermission('namespace-b', 'member-user', memberPermission);
      await insertPermission('namespace-a', 'other-user', memberPermission);
      await insertPermission('namespace-c', 'other-user', memberPermission);
    });

    it('returns namespaces either for user memberships or public', async () => {
      const result = await new NamespaceRepository().find([], 'member-user', 'id');

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data.map((namespace) => namespace.id)).toEqual(['namespace-a', 'namespace-b']);
    });

    it('returns public namespaces even when user has no memberships', async () => {
      const result = await new NamespaceRepository().find([], 'no-membership-user', 'id');

      expect(result.ok).toBeTruthy();

      expect(result.ok && result.data.map((namespace) => namespace.id)).toEqual(['namespace-a']);
    });

    it('applies query filter', async () => {
      const result = await new NamespaceRepository().find(
        [
          {
            name: 'presenceName',
            op: 'eq',
            value: 'Namespace A',
          },
        ],
        'member-user',
        'id'
      );

      expect(result.ok).toBeTruthy();

      expect(result.ok && result.data.map((namespace) => namespace.id)).toEqual(['namespace-a']);
    });

    it('applies limit', async () => {
      const result = await new NamespaceRepository().find([], 'member-user', 'id', 10);

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toHaveLength(2);
      expect(result.ok && result.data[0]?.id).toBe('namespace-a');
    });
  });
});
