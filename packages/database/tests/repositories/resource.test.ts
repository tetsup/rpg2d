import { execute } from '@database/client/mongo-client';
import { resourcesCollection } from '@database/collections/resources';
import { resourceEdgesCollection } from '@database/collections/resource-edges';
import {
  createResource,
  updateResource,
  getResource,
  findResources,
  findIncomingReferences,
  deleteResource,
} from '@database/repositories/resource';

const validResource = {
  id: 'sample/player/hero.v0',
  type: 'player',
  name: {
    type: 'fixed',
    value: 'hero',
  },
  initialSkin: 'sample/skin/hero.v0',
  initialState: {
    hp: 100,
  },
};

describe('resource repository integration', () => {
  beforeEach(async () => {
    await execute(async (tx) => {
      await resourcesCollection(tx).deleteMany({});
      await resourceEdgesCollection(tx).deleteMany({});
    });
  });

  describe('getResource', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourcesCollection(tx).insertOne({
          id: validResource.id,
          data: {
            hp: 100,
          },
        } as any);
      });
    });

    it('returns existing resource', async () => {
      const result = await getResource(validResource.id);

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual({
          hp: 100,
        });
      }
    });

    it('returns not_found when missing', async () => {
      const result = await getResource('sample/player/missing.v0');

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });

    it('does not mutate database', async () => {
      const before = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });
      await getResource(validResource.id);
      const after = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  describe('createResource', () => {
    it('creates resource', async () => {
      const result = await createResource(validResource);

      expect(result.ok).toBeTruthy();

      const inserted = await execute(async (tx) => {
        return resourcesCollection(tx).findOne({
          id: validResource.id,
        });
      });

      expect(inserted).toBeTruthy();
    });

    it('creates reference edges', async () => {
      const result = await createResource(validResource);

      expect(result.ok).toBeTruthy();

      const edges = await execute(async (tx) => {
        return resourceEdgesCollection(tx)
          .find({
            from: validResource.id,
          })
          .toArray();
      });

      expect(edges.length).toBeGreaterThan(0);
    });

    it('returns already_exists on duplicate id', async () => {
      await execute(async (tx) => {
        await resourcesCollection(tx).insertOne({
          id: validResource.id,
        } as any);
      });

      const result = await createResource(validResource);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('already_exists');
      }
    });

    it('does not partially insert on failure', async () => {
      await execute(async (tx) => {
        await resourcesCollection(tx).insertOne({
          id: validResource.id,
        } as any);
      });

      const before = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      await createResource(validResource);

      const after = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  describe('updateResource', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourcesCollection(tx).insertOne({
          id: validResource.id,
          data: {
            ...validResource,
            initialState: {
              hp: 100,
            },
          },
        } as any);

        await resourceEdgesCollection(tx).insertOne({
          from: validResource.id,
          to: 'sample/skin/old.v0',
          type: 'reference',
        });
      });
    });

    it('updates resource', async () => {
      const result = await updateResource({
        ...validResource,
        initialState: {
          hp: 200,
        },
      });

      expect(result.ok).toBeTruthy();

      const updated = (await execute(async (tx) => {
        return resourcesCollection(tx).findOne({
          id: validResource.id,
        });
      })) as any;

      expect(updated?.data.initialState.hp).toBe(200);
    });

    it('replaces reference edges', async () => {
      await updateResource({
        ...validResource,
        initialSkin: 'sample/skin/new.v0',
      });

      const edges = await execute(async (tx) => {
        return resourceEdgesCollection(tx)
          .find({
            from: validResource.id,
          })
          .toArray();
      });

      expect(edges).toHaveLength(1);

      expect(edges[0]?.to).toBe('sample/skin/new.v0');
    });

    it('returns not_found when missing', async () => {
      const result = await updateResource({
        ...validResource,
        id: 'sample/player/missing.v0',
      });

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });

    it('does not mutate missing resource', async () => {
      const before = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      await updateResource({
        ...validResource,
        id: 'sample/player/missing.v0',
      });

      const after = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  describe('findResources', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourcesCollection(tx).insertMany([
          {
            id: 'sample/player/hero.v0',
            namespace: 'sample',
            type: 'player',
            data: {
              id: 'sample/player/hero.v0',
            },
          },
          {
            id: 'sample/player/villain.v0',
            namespace: 'sample',
            type: 'player',
            data: {
              id: 'sample/player/villain.v0',
            },
          },
          {
            id: 'other/map/test.v0',
            namespace: 'other',
            type: 'map',
            data: {
              id: 'other/map/test.v0',
            },
          },
        ] as any[]);
      });
    });

    it('returns all resources', async () => {
      const result = await findResources({});

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(3);
      }
    });

    it('filters by type', async () => {
      const result = await findResources({
        type: 'player',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(2);
      }
    });

    it('filters by namespace', async () => {
      const result = await findResources({
        namespace: 'other',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(1);
      }
    });

    it('filters by query', async () => {
      const result = await findResources({
        query: 'hero',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(1);
      }
    });

    it('supports cursor pagination', async () => {
      const result = await findResources({
        cursor: 'sample/player/hero.v0',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items.some((v) => v.id === 'sample/player/hero.v0')).toBeFalsy();
      }
    });

    it('supports limit pagination', async () => {
      const result = await findResources({
        limit: 1,
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toHaveLength(1);

        expect(result.data.hasMore).toBeTruthy();

        expect(result.data.nextCursor).toBeTruthy();
      }
    });

    it('returns empty result normally', async () => {
      const result = await findResources({
        query: 'missing',
      });

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data.items).toEqual([]);
      }
    });

    it('does not mutate database', async () => {
      const before = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      await findResources({});

      const after = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  //
  // findIncomingReferences
  //

  describe('findIncomingReferences', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourceEdgesCollection(tx).insertOne({
          from: 'sample/map/test.v0',
          to: validResource.id,
          type: 'reference',
        });
      });
    });

    it('returns incoming references', async () => {
      const result = await findIncomingReferences(validResource.id);

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toHaveLength(1);
      }
    });

    it('returns empty array normally', async () => {
      const result = await findIncomingReferences('sample/player/missing.v0');

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data).toEqual([]);
      }
    });

    it('does not mutate database', async () => {
      const before = await execute(async (tx) => {
        return resourceEdgesCollection(tx).countDocuments();
      });

      await findIncomingReferences(validResource.id);

      const after = await execute(async (tx) => {
        return resourceEdgesCollection(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });

  //
  // deleteResource
  //

  describe('deleteResource', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourcesCollection(tx).insertOne({
          id: validResource.id,
        } as any);

        await resourceEdgesCollection(tx).insertMany([
          {
            from: validResource.id,
            to: 'a',
            type: 'reference',
          },
          {
            from: 'b',
            to: validResource.id,
            type: 'reference',
          },
        ]);
      });
    });

    it('deletes resource', async () => {
      const result = await deleteResource(validResource.id);

      expect(result.ok).toBeTruthy();

      const resource = await execute(async (tx) => {
        return resourcesCollection(tx).findOne({
          id: validResource.id,
        });
      });

      expect(resource).toBeNull();
    });

    it('deletes related edges', async () => {
      await deleteResource(validResource.id);

      const edges = await execute(async (tx) => {
        return resourceEdgesCollection(tx).find({}).toArray();
      });

      expect(edges).toHaveLength(0);
    });

    it('returns not_found when missing', async () => {
      const result = await deleteResource('sample/player/missing.v0');

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('not_found');
      }
    });

    it('does not mutate database when missing', async () => {
      const before = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      await deleteResource('sample/player/missing.v0');

      const after = await execute(async (tx) => {
        return resourcesCollection(tx).countDocuments();
      });

      expect(after).toBe(before);
    });
  });
});
