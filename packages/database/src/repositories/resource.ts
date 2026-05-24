import { Filter } from 'mongodb';
import { resourcesCollection } from '../collections/resource';
import { resourceEdgesCollection } from '../collections/edge';
import { parseResourceId } from '../utils/parser';
import { extractResourceRefs } from '../utils/refs';

type SaveParams = {
  id: string;
  data: unknown;
};

type FindParams = {
  query?: string;
  type?: string;
  namespace?: string;
  cursor?: string;
  limit?: number;
};

export async function saveResource({ id, data }: SaveParams) {
  const resources = await resourcesCollection();
  const edges = await resourceEdgesCollection();
  const parsed = parseResourceId(id);
  const refs = extractResourceRefs(data);
  const now = new Date();
  await resources.updateOne(
    {
      id,
    },
    {
      $set: {
        id,
        namespace: parsed.namespace,
        type: parsed.type,
        name: parsed.name,
        refs,
        data,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    {
      upsert: true,
    }
  );

  await edges.deleteMany({
    from: id,
  });

  if (refs.length > 0) {
    await edges.insertMany(
      refs.map((ref) => ({
        from: id,
        to: ref,
        type: 'reference',
      }))
    );
  }
}

export async function findResourceById(id: string) {
  const resources = await resourcesCollection();
  return resources.findOne({
    id,
  });
}

export async function findResources({ query, type, namespace, cursor, limit = 40 }: FindParams) {
  const resources = await resourcesCollection();
  const filter: Filter<any> = {};
  if (type) {
    filter.type = type;
  }
  if (namespace) {
    filter.namespace = namespace;
  }
  if (query) {
    filter.id = {
      $regex: query,
      $options: 'i',
    };
  }
  if (cursor) {
    filter.id = {
      ...(filter.id ?? {}),
      $gt: cursor,
    };
  }
  const items = await resources
    .find(filter)
    .sort({
      id: 1,
    })
    .limit(limit + 1)
    .toArray();
  const hasMore = items.length > limit;
  const sliced = items.slice(0, limit);
  return {
    items: sliced,
    hasMore,
    nextCursor: hasMore ? sliced.at(-1)?.id : undefined,
  };
}

export async function findIncomingReferences(id: string) {
  const edges = await resourceEdgesCollection();
  return edges
    .find({
      to: id,
    })
    .toArray();
}

export async function deleteResource(id: string) {
  const resources = await resourcesCollection();
  const edges = await resourceEdgesCollection();
  await resources.deleteOne({
    id,
  });
  await edges.deleteMany({
    $or: [
      {
        from: id,
      },
      {
        to: id,
      },
    ],
  });
}
