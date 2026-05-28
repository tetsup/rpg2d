import { resourcesCollection } from '@database/collections/resources';
import { execute } from '@database/client/mongo-client';
import { createResource, updateResource, getResource, deleteResource } from '@database/repositories/resource';

describe('resource repository', () => {
  describe('getResource', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await resourcesCollection(tx).insertOne({
          id: 'sample/player/hero.v0',
          data: {
            hp: 100,
          },
        } as any);
      });
    });
    it('returns correct data', async () => {
      const result = await getResource('sample/player/hero.v0');
      expect(result.ok).toBeTruthy();
      expect(result.ok && result.data).toEqual({
        hp: 100,
      });
    });
  });
});
