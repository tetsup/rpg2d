import { describe, it, beforeEach } from '@tests/setup/integration-test';
import { NamespaceRepository } from '@database/repositories/namespace';
import { clearTables } from './helpers/db';
import { insertNamespace, insertPermission, memberPermission } from './helpers/fixtures';

describe('namespace repository error mapping', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await clearTables();
  });

  describe('create', () => {
    it('maps namespace insert failure', async () => {
      await insertNamespace({ id: 'sample' });

      const result = await new NamespaceRepository().create(
        { id: 'sample', presenceName: 'Sample', description: '', isPrivate: true },
        'dummy-user'
      );

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('already_exists');
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
        presenceName: 'missing',
        description: '',
        isPrivate: false,
      });
      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });

  describe('delete', () => {
    // TODO: Repository delete does not check numDeletedRows yet; it currently succeeds for missing namespaces.
    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().delete('missing');

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });

  describe('addPermission', () => {
    it('returns already_exists when duplicated', async () => {
      await insertNamespace({ id: 'sample' });
      await insertPermission('sample', 'member-user', memberPermission);

      const result = await new NamespaceRepository().addPermission({
        namespaceId: 'sample',
        userId: 'member-user',
        permission: memberPermission,
      });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('already_exists');
    });
  });

  describe('removePermission', () => {
    // TODO: Repository removePermission does not check affected row count yet.
    it('returns not_found when missing', async () => {
      const result = await new NamespaceRepository().removePermission({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });

  describe('checkPermissions', () => {
    beforeEach(async () => {
      await insertNamespace({ id: 'sample', presenceName: 'Sample' });
    });

    it('returns empty permissions when membership is missing', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'sample',
        userId: 'missing-user',
      });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toEqual([]);
    });

    it('returns empty permissions when namespace is missing', async () => {
      const result = await new NamespaceRepository().checkPermissions({
        namespaceId: 'missing',
        userId: 'owner-user',
      });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toEqual([]);
    });
  });
});
