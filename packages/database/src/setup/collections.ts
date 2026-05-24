import { resourcesCollection } from '../collections/resource';
import { resourceEdgesCollection } from '../collections/edge';

export async function ensureIndexes() {
  const resources = await resourcesCollection();
  await resources.createIndexes([
    {
      key: {
        id: 1,
      },
      unique: true,
    },
    {
      key: {
        namespace: 1,
        type: 1,
      },
    },
    {
      key: {
        updatedAt: -1,
      },
    },
    {
      key: {
        refs: 1,
      },
    },
  ]);

  const edges = await resourceEdgesCollection();
  await edges.createIndexes([
    {
      key: {
        from: 1,
      },
    },
    {
      key: {
        to: 1,
      },
    },
  ]);
}
