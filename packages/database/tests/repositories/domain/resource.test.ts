import { execute } from '@database/client/pg-client';
import type { ResourcePath } from '@sharedTypes/resource/common';
import { ResourceRepository } from '@database/repositories/resource';
import { formatResourceId } from '@schema/resource/common/base';
import { clearTables, countRows } from './helpers/db';
import {
  createPlayerDocument,
  insertNamespace,
  insertPermission,
  insertPlayerWithDependencies,
  insertResource,
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
  await insertUser({ id: 'dummy-user' });
  await insertUser({ id: testUserId });
  await insertNamespace({ id: 'sample' });
  await insertNamespace({ id: 'other' });
  await insertPermission('sample', testUserId, 'reader');
  await insertPermission('other', testUserId, 'reader');

  await insertResourceRow(
    { namespace: 'sample', type: 'player', name: 'hero' },
    { name: { type: 'fixed', value: 'hero' } }
  );
  await insertResourceRow(
    { namespace: 'sample', type: 'entity', name: 'villain' },
    { name: { type: 'fixed', value: 'villain' } }
  );
  await insertResourceRow({ namespace: 'other', type: 'player', name: 'test' }, {});
}

describe('ResourceRepository', () => {
  beforeEach(async () => {
    await clearTables();
  });

  describe('get', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertUser({ id: testUserId });
      await insertPermission('sample', testUserId, 'reader');
      await insertPlayerWithDependencies(validPlayerPath);
    });

    it('returns existing resource', async () => {
      const result = await new ResourceRepository().get(validPlayerPath);

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toMatchObject({
          id: formatResourceId(validPlayerPath),
          namespace: validPlayerPath.namespace,
          type: validPlayerPath.type,
          name: validPlayerPath.name,
          version: 0,
          isDraft: false,
          createdBy: 'dummy-user',
        });
        expect(result.data.data).toEqual(validPlayerData);
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
      await insertUser({ id: 'dummy-user' });
      await insertUser({ id: 'creator-user' });
      await insertNamespace({ id: 'sample' });
      await insertSkinDependencies();
    });

    it('creates resource', async () => {
      const result = await new ResourceRepository().create(validPlayerPath, createPlayerDocument(), 'creator-user');

      expect(result.ok).toBeTruthy();

      const inserted = await execute(async (db) => {
        return db
          .selectFrom('resources')
          .selectAll()
          .where('id', '=', formatResourceId(validPlayerPath))
          .executeTakeFirst();
      });

      expect(inserted).toBeTruthy();
      expect(inserted?.createdBy).toBe('creator-user');
    });

    it('creates reference edges', async () => {
      const result = await new ResourceRepository().create(validPlayerPath, createPlayerDocument(), 'creator-user');

      expect(result.ok).toBeTruthy();

      const edges = await execute(async (db) => {
        return db
          .selectFrom('resource_edges')
          .selectAll()
          .where('from', '=', formatResourceId(validPlayerPath))
          .execute();
      });

      expect(edges.length).toBeGreaterThan(0);
    });

    it('returns already_exists on duplicate id', async () => {
      await insertResource(validPlayerPath);
      const result = await new ResourceRepository().create(validPlayerPath, createPlayerDocument(), 'creator-user');

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('already_exists');
    });

    it('does not partially insert on failure', async () => {
      await insertResource(validPlayerPath);

      const before = await countRows('resources');

      await new ResourceRepository().create(validPlayerPath, createPlayerDocument(), 'creator-user');

      const after = await countRows('resources');

      expect(after).toBe(before);
    });
  });

  describe('update', () => {
    const newSkinPath = { namespace: 'sample', type: 'skin', name: 'new' } as ResourcePath;

    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertSkinDependencies();
      await insertSkinResource('sample', 'new', 'new');
      await insertUser({ id: testUserId });
      await insertPermission('sample', testUserId, 'reader');
      await insertResource(validPlayerPath);
      await insertResourceEdge(
        formatResourceId(validPlayerPath),
        formatResourceId({ namespace: 'sample', type: 'skin', name: 'hero' })
      );
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
        expect(got.data.data.initialState?.hp).toBe(200);
      }
    });

    it('replaces reference edges', async () => {
      await new ResourceRepository().update(validPlayerPath, {
        ...createPlayerDocument(),
        data: { ...validPlayerData, initialSkin: formatResourceId(newSkinPath) },
      });

      const edges = await execute(async (db) => {
        return db
          .selectFrom('resource_edges')
          .selectAll()
          .where('from', '=', formatResourceId(validPlayerPath))
          .execute();
      });

      expect(edges).toHaveLength(1);
      expect(edges[0]?.to).toBe(formatResourceId(newSkinPath));
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
      const result = await new ResourceRepository().find([{ name: 'name', op: 'eq', value: 'hero' }], testUserId, 'id');

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toHaveLength(1);
      }
    });

    it('filters by id prefix', async () => {
      const result = await new ResourceRepository().find(
        [{ name: 'id', op: 'startsWith', value: 'sample/player/h' }],
        testUserId,
        'id'
      );

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.id).toBe('sample/player/hero');
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
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertSkinDependencies();
      await insertResourceRow({ namespace: 'sample', type: 'map', name: 'test' }, {});
      await insertResource(validPlayerPath);
      await insertResourceEdge('sample/map/test', formatResourceId(validPlayerPath));
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

  describe('getCreatedBy', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertResource(validPlayerPath, validPlayerData, { createdBy: 'dummy-user' });
    });

    it('returns createdBy for an existing resource', async () => {
      const result = await new ResourceRepository().getCreatedBy(validPlayerPath);

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toBe('dummy-user');
    });

    it('returns not_found when missing', async () => {
      const result = await new ResourceRepository().getCreatedBy({
        namespace: 'sample',
        type: 'player',
        name: 'missing',
      });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await insertUser({ id: 'dummy-user' });
      await insertNamespace({ id: 'sample' });
      await insertSkinDependencies();
      await insertResourceRow({ namespace: 'sample', type: 'image', name: 'a' }, {});
      await insertResourceRow({ namespace: 'sample', type: 'image', name: 'b' }, {});
      await insertResource(validPlayerPath);
      await insertResourceEdge(formatResourceId(validPlayerPath), 'sample/image/a');
      await insertResourceEdge('sample/image/b', formatResourceId(validPlayerPath));
    });

    it('deletes resource', async () => {
      const result = await new ResourceRepository().delete(validPlayerPath);

      expect(result.ok).toBeTruthy();

      const resource = await execute(async (db) => {
        return db
          .selectFrom('resources')
          .selectAll()
          .where('id', '=', formatResourceId(validPlayerPath))
          .executeTakeFirst();
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
