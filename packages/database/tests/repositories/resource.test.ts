import { ObjectId } from 'mongodb';
import { execute } from '@database/client/mongo-client';
import type { ResourcePath } from '@sharedTypes/resource/common';
import { resourceCollectionBuilder } from '@database/collections/resources';
import { resourceEdgeCollectionBuilder } from '@database/collections/resource-edges';
import { ResourceRepository } from '@database/repositories/resource';
import { buildId } from '@database/utils/resource';

const validPath = {
  namespace: 'sample',
  type: 'player',
  name: 'hero',
} as ResourcePath;

const validData = {
  name: {
    type: 'fixed',
    value: 'hero',
  },
  initialSkin: 'sample/skin/hero.v0',
  initialState: {
    hp: 100,
  },
} as const;

const validDocument = {
  ...validPath,
  data: validData,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ResourceRepository', () => {
  beforeEach(async () => {
    await execute(async (tx) => {
      await resourceCollectionBuilder(tx).deleteMany({});
      await resourceEdgeCollectionBuilder(tx).deleteMany({});
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourceCollectionBuilder(tx).insertOne(validDocument);
      });
    });

    it('returns existing resource', async () => {
      const result = await new ResourceRepository().get(validPath);

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual(validData);
      }
    });

    it('returns not_found when missing', async () => {
      const result = await new ResourceRepository().get({ namespace: 'sample', type: 'player', name: 'notexistuser' });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });

    it('does not mutate database', async () => {
      const before = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });
      await new ResourceRepository().get(validPath);
      const after = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  describe('create', () => {
    it('creates resource', async () => {
      const result = await new ResourceRepository().create(validPath, validData);

      expect(result.ok).toBeTruthy();

      const inserted = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).findOne(validPath);
      });

      expect(inserted).toBeTruthy();
    });

    it('creates reference edges', async () => {
      const result = await new ResourceRepository().create(validPath, validData);

      expect(result.ok).toBeTruthy();

      const edges = await execute(async (tx) => {
        return resourceEdgeCollectionBuilder(tx)
          .find({
            from: buildId(validPath),
          })
          .toArray();
      });

      expect(edges.length).toBeGreaterThan(0);
    });

    it('returns already_exists on duplicate id', async () => {
      await execute(async (tx) => {
        await resourceCollectionBuilder(tx).insertOne(validDocument);
      });

      const result = await new ResourceRepository().create(validPath, validData);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('already_exists');
      }
    });

    it('does not partially insert on failure', async () => {
      await execute(async (tx) => {
        await resourceCollectionBuilder(tx).insertOne(validDocument);
      });

      const before = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });

      await new ResourceRepository().create(validPath, validData);

      const after = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourceCollectionBuilder(tx).insertOne({
          ...validPath,
          data: {
            ...validData,
            initialState: {
              hp: 100,
            },
          },
        } as any);

        await resourceEdgeCollectionBuilder(tx).insertOne({
          from: buildId(validPath),
          to: 'sample/skin/old.v0',
          type: 'reference',
        });
      });
    });

    it('updates resource', async () => {
      const result = await new ResourceRepository().update(validPath, { ...validData, initialState: { hp: 200 } });

      expect(result.ok).toBeTruthy();

      const updated = (await execute(async (tx) => {
        return resourceCollectionBuilder(tx).findOne(validPath);
      })) as any;

      expect(updated?.data.initialState.hp).toBe(200);
    });

    it('replaces reference edges', async () => {
      await new ResourceRepository().update(validPath, { ...validData, initialSkin: 'sample/skin/new.v0' });
      const edges = await execute(async (tx) => {
        return resourceEdgeCollectionBuilder(tx)
          .find({ from: buildId(validPath) })
          .toArray();
      });

      expect(edges).toHaveLength(1);
      expect(edges[0]?.to).toBe('sample/skin/new.v0');
    });

    it('returns not_found when missing', async () => {
      const result = await new ResourceRepository().update({ ...validPath, name: 'missing' }, validData);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });

    it('does not mutate missing resource', async () => {
      const before = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });
      await new ResourceRepository().update({ ...validPath, name: 'missing' }, validData);
      const after = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  describe('find', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourceCollectionBuilder(tx).insertMany([
          {
            _id: new ObjectId('6a1b11acb666f5d025744d19'),
            namespace: 'sample',
            type: 'player',
            name: 'hero.v0',
            data: 'something',
          },
          {
            _id: new ObjectId('6a1b11acb666f5d025744d1a'),
            namespace: 'sample',
            type: 'player',
            name: 'villain.v0',
            data: 'something',
          },
          {
            _id: new ObjectId('6a1b11acb666f5d025744d1b'),
            namespace: 'other',
            type: 'map',
            name: 'test.v0',
            data: 'anything',
          },
        ] as any[]);
      });
    });

    it('returns all resources', async () => {
      const result = await new ResourceRepository().find({});

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(3);
      }
    });

    it('filters by type', async () => {
      const result = await new ResourceRepository().find({
        type: 'player',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(2);
      }
    });

    it('filters by namespace', async () => {
      const result = await new ResourceRepository().find({
        namespace: 'other',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(1);
      }
    });

    it('filters by name', async () => {
      const result = await new ResourceRepository().find({
        name: 'hero',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(1);
      }
    });

    it('supports cursor pagination', async () => {
      const result = await new ResourceRepository().find({
        cursor: '6a1b11acb666f5d025744d19',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items.some((v) => v.id === 'sample/player/hero.v0')).toBeFalsy();
      }
    });

    it('supports limit pagination', async () => {
      const result = await new ResourceRepository().find({
        limit: 1,
      });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data.items).toHaveLength(1);
      expect(result.ok && result.data.hasMore).toBeTruthy();
      expect(result.ok && result.data.nextCursor).toBeTruthy();
    });

    it('returns empty result normally', async () => {
      const result = await new ResourceRepository().find({
        name: 'missing',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toEqual([]);
      }
    });

    it('does not mutate database', async () => {
      const before = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });

      await new ResourceRepository().find({});

      const after = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  describe('findIncomingReferences', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourceEdgeCollectionBuilder(tx).insertOne({
          from: 'sample/map/test.v0',
          to: buildId(validPath),
          type: 'reference',
        });
      });
    });

    it('returns incoming references', async () => {
      const result = await new ResourceRepository().findIncomingReferences(validPath);

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toHaveLength(1);
    });

    it('returns empty array normally', async () => {
      const result = await new ResourceRepository().findIncomingReferences({ ...validPath, name: 'missing.v0' });

      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toEqual([]);
    });

    it('does not mutate database', async () => {
      const before = await execute(async (tx) => {
        return resourceEdgeCollectionBuilder(tx).countDocuments();
      });
      await new ResourceRepository().findIncomingReferences(validPath);
      const after = await execute(async (tx) => {
        return resourceEdgeCollectionBuilder(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourceCollectionBuilder(tx).insertOne(validDocument);
        await resourceEdgeCollectionBuilder(tx).insertMany([
          {
            from: buildId(validPath),
            to: 'a',
            type: 'reference',
          },
          {
            from: 'b',
            to: buildId(validPath),
            type: 'reference',
          },
        ]);
      });
    });

    it('deletes resource', async () => {
      const result = await new ResourceRepository().delete(validPath);

      expect(result.ok).toBeTruthy();

      const resource = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).findOne(validPath);
      });

      expect(resource).toBeNull();
    });

    it('deletes related edges', async () => {
      await new ResourceRepository().delete(validPath);
      const edges = await execute(async (tx) => {
        return resourceEdgeCollectionBuilder(tx).find({}).toArray();
      });

      expect(edges).toHaveLength(0);
    });

    it('returns not_found when missing', async () => {
      const result = await new ResourceRepository().delete({ ...validPath, name: 'missing.v0' });

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('not_found');
    });

    it('does not mutate database when missing', async () => {
      const before = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });
      await new ResourceRepository().delete({ ...validPath, name: 'missing.v0' });
      const after = await execute(async (tx) => {
        return resourceCollectionBuilder(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });
});
