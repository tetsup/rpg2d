import { execute } from '@database/client/pg-client';
import type { ResourcePath } from '@sharedTypes/resource/common';
import { ResourceRepository } from '@database/repositories/resource';
import { buildId } from '@database/utils/resource';
import { clearTables, countRows } from './helpers/db';
import {
  createPlayerDocument,
  insertNamespace,
  insertPermission,
  insertPlayerWithDependencies,
  insertResourceEdge,
  insertResourceRow,
  insertSkinDependencies,
  insertSkinResource,
  insertUser,
  validPlayerData,
  validPlayerPath,
} from './helpers/fixtures';

const testUserId = 'test-user';

async function seedResourceFindFixtures() {
  await insertUser({ id: testUserId });
  await insertNamespace({ id: 'sample' });
  await insertNamespace({ id: 'other' });
  await insertPermission('sample', testUserId, 'reader', { ensureUser: false });
  await insertPermission('other', testUserId, 'reader', { ensureUser: false });

  await insertResourceRow({ namespace: 'sample', type: 'player', name: 'hero' }, { name: { type: 'fixed', value: 'hero' } }, {
    ensureNamespace: false,
  });
  await insertResourceRow(
    { namespace: 'sample', type: 'player', name: 'villain' },
    { name: { type: 'fixed', value: 'villain' } },
    { ensureNamespace: false }
  );
  await insertResourceRow({ namespace: 'other', type: 'map', name: 'test' }, {}, { ensureNamespace: false });
}

describe('ResourceRepository', () => {
  beforeEach(async () => {
    await clearTables();
  });

  describe('get', () => {
    beforeEach(async () => {
      await insertPlayerWithDependencies(validPlayerPath, { ensurePermissionForUser: testUserId });
    });

    it('returns existing resource', async () => {
      const result = await new ResourceRepository().get(validPlayerPath);

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual(validPlayerData);
      }
    });

    it('returns not_found when missing', async () => {
      const result = await new ResourceRepository().get({
        namespace: 'sample',
        type: 'player',
        name: 'notexistuser',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });

    it('does not mutate database', async () => {
      const before = await countRows('resources');
      await new ResourceRepository().get(validPlayerPath);
      const after = await countRows('resources');

      expect(after).toBe(before);
    });
  });

  describe('create', () => {
    beforeEach(async () => {
      await insertNamespace({ id: 'sample' });
      await insertSkinDependencies();
    });

    it('creates resource', async () => {
      const result = await new ResourceRepository().create(validPlayerPath, createPlayerDocument());

      expect(result.ok).toBeTruthy();

      const inserted = await execute(async (db) => {
        return db.selectFrom('resources').selectAll().where('id', '=', buildId(validPlayerPath)).executeTakeFirst();
      });

      expect(inserted).toBeTruthy();
    });

    it('creates reference edges', async () => {
      const result = await new ResourceRepository().create(validPlayerPath, createPlayerDocument());

      expect(result.ok).toBeTruthy();

      const edges = await execute(async (db) => {
        return db.selectFrom('resource_edges').selectAll().where('from', '=', buildId(validPlayerPath)).execute();
      });

      expect(edges.length).toBeGreaterThan(0);
    });

    it('returns already_exists on duplicate id', async () => {
      await insertPlayerWithDependencies(validPlayerPath, { ensureNamespace: false });
      const result = await new ResourceRepository().create(validPlayerPath, createPlayerDocument());

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('already_exists');
    });

    it('does not partially insert on failure', async () => {
      await insertPlayerWithDependencies(validPlayerPath, { ensureNamespace: false });

      const before = await countRows('resources');

      await new ResourceRepository().create(validPlayerPath, createPlayerDocument());

      const after = await countRows('resources');

      expect(after).toBe(before);
    });
  });

  describe('update', () => {
    const newSkinPath = { namespace: 'sample', type: 'skin', name: 'new' } as ResourcePath;

    beforeEach(async () => {
      await insertNamespace({ id: 'sample' });
      await insertSkinDependencies();
      await insertSkinResource('sample', 'new', 'new');
      await insertPlayerWithDependencies(validPlayerPath, {
        ensureNamespace: false,
        ensurePermissionForUser: testUserId,
      });

      await insertResourceEdge(buildId(validPlayerPath), buildId({ namespace: 'sample', type: 'skin', name: 'hero' }));
    });

    it('updates resource', async () => {
      const result = await new ResourceRepository().update(validPlayerPath, {
        ...createPlayerDocument(),
        data: { ...validPlayerData, initialState: { hp: 200 } },
      });

      expect(result.ok).toBeTruthy();

      const got = await new ResourceRepository().get(validPlayerPath);
      expect(got.ok).toBeTruthy();

      if (got.ok) {
        const innerData = 'initialState' in got.data ? got.data : (got.data as { data: typeof validPlayerData }).data;
        expect((innerData as { initialState?: { hp?: number } }).initialState?.hp).toBe(200);
      }
    });

    it('replaces reference edges', async () => {
      await new ResourceRepository().update(validPlayerPath, {
        ...createPlayerDocument(),
        data: { ...validPlayerData, initialSkin: buildId(newSkinPath) },
      });

      const edges = await execute(async (db) => {
        return db.selectFrom('resource_edges').selectAll().where('from', '=', buildId(validPlayerPath)).execute();
      });

      expect(edges).toHaveLength(1);
      expect(edges[0]?.to).toBe(buildId(newSkinPath));
    });

    it('returns not_found when missing', async () => {
      const missingPath = { namespace: 'sample', type: 'player', name: 'missing' } as ResourcePath;
      const result = await new ResourceRepository().update(missingPath, createPlayerDocument(missingPath));

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });

    it('does not mutate missing resource', async () => {
      const before = await countRows('resources');
      const missingPath = { namespace: 'sample', type: 'player', name: 'missing' } as ResourcePath;
      await new ResourceRepository().update(missingPath, createPlayerDocument(missingPath));
      const after = await countRows('resources');

      expect(after).toBe(before);
    });
  });

  describe('find', () => {
    // TODO: applyResourceFilter currently does not assign the applyFilter return value in production code.
    beforeEach(async () => {
      await seedResourceFindFixtures();
    });

    it('returns all resources', async () => {
      const result = await new ResourceRepository().find([], testUserId, 'id');

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toHaveLength(3);
      }
    });

    it('filters by type', async () => {
      const result = await new ResourceRepository().find(
        [{ name: 'type', op: 'eq', value: 'player' }],
        testUserId,
        'id'
      );

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('filters by namespace', async () => {
      const result = await new ResourceRepository().find(
        [{ name: 'namespace', op: 'eq', value: 'other' }],
        testUserId,
        'id'
      );

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toHaveLength(1);
      }
    });

    it('filters by name', async () => {
      const result = await new ResourceRepository().find(
        [{ name: 'name', op: 'eq', value: 'hero' }],
        testUserId,
        'id'
      );

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toHaveLength(1);
      }
    });

    it('filters by id prefix', async () => {
      const result = await new ResourceRepository().find(
        [{ name: 'id', op: 'startsWith', value: 'sample/player/v' }],
        testUserId,
        'id'
      );

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.id).toBe('sample/player/villain');
      }
    });

    it('supports limit', async () => {
      const result = await new ResourceRepository().find([], testUserId, 'id', 10);

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toHaveLength(3);
    });

    it('returns empty result normally', async () => {
      const result = await new ResourceRepository().find(
        [{ name: 'name', op: 'eq', value: 'missing' }],
        testUserId,
        'id'
      );

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual([]);
      }
    });

    it('does not mutate database', async () => {
      const before = await countRows('resources');

      await new ResourceRepository().find([], testUserId, 'id');

      const after = await countRows('resources');

      expect(after).toBe(before);
    });
  });

  describe('findIncomingReferences', () => {
    beforeEach(async () => {
      await insertNamespace({ id: 'sample' });
      await insertSkinDependencies();
      await insertResourceRow({ namespace: 'sample', type: 'map', name: 'test' }, {}, { ensureNamespace: false });
      await insertPlayerWithDependencies(validPlayerPath, { ensureNamespace: false });
      await insertResourceEdge('sample/map/test', buildId(validPlayerPath));
    });

    it('returns incoming references', async () => {
      const result = await new ResourceRepository().findIncomingReferences(validPlayerPath);

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toHaveLength(1);
    });

    it('returns empty array normally', async () => {
      const result = await new ResourceRepository().findIncomingReferences({
        ...validPlayerPath,
        name: 'missing',
      });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toEqual([]);
    });

    it('does not mutate database', async () => {
      const before = await countRows('resource_edges');
      await new ResourceRepository().findIncomingReferences(validPlayerPath);
      const after = await countRows('resource_edges');

      expect(after).toBe(before);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await insertNamespace({ id: 'sample' });
      await insertSkinDependencies();
      await insertResourceRow({ namespace: 'sample', type: 'map', name: 'a' }, {}, { ensureNamespace: false });
      await insertResourceRow({ namespace: 'sample', type: 'map', name: 'b' }, {}, { ensureNamespace: false });
      await insertPlayerWithDependencies(validPlayerPath, { ensureNamespace: false });
      await insertResourceEdge(buildId(validPlayerPath), 'sample/map/a');
      await insertResourceEdge('sample/map/b', buildId(validPlayerPath));
    });

    it('deletes resource', async () => {
      const result = await new ResourceRepository().delete(validPlayerPath);

      expect(result.ok).toBeTruthy();

      const resource = await execute(async (db) => {
        return db.selectFrom('resources').selectAll().where('id', '=', buildId(validPlayerPath)).executeTakeFirst();
      });

      expect(resource).toBeUndefined();
    });

    it('deletes related edges', async () => {
      await new ResourceRepository().delete(validPlayerPath);
      const edges = await execute(async (db) => {
        return db.selectFrom('resource_edges').selectAll().execute();
      });

      expect(edges).toHaveLength(0);
    });

    it('returns not_found when missing', async () => {
      const result = await new ResourceRepository().delete({ ...validPlayerPath, name: 'missing' });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });

    it('does not mutate database when missing', async () => {
      const before = await countRows('resources');
      await new ResourceRepository().delete({ ...validPlayerPath, name: 'missing' });
      const after = await countRows('resources');

      expect(after).toBe(before);
    });
  });
});
