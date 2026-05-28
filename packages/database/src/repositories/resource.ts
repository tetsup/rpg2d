import type { DeleteResult, Filter } from 'mongodb';
import type { ResourceType } from '@sharedTypes/resource/common';
import { resourcesCollection } from '@database/collections/resources';
import { resourceEdgesCollection } from '@database/collections/resource-edges';
import { ResourceSchemaUnion } from '@schema/resource/common/resolver';
import { splitId } from '@schema/resource/common/base';
import { extractResourceRefs } from '@database/utils/refs';
import { createResourceDocumentSchema } from '@database/schemas/resource';
import { RepositoryNotFoundError, RepositoryResult, repositorySafe } from './util';
import { execute, withTransaction } from '@database/client/mongo-client';

type SaveParams = {
  data: object;
  create: boolean;
};

type FindParams = {
  query?: string;
  type?: string;
  namespace?: string;
  cursor?: string;
  limit?: number;
};

export async function createResource(data: object): Promise<RepositoryResult<void>> {
  return await saveResource({ data, create: true });
}

export async function updateResource(data: object): Promise<RepositoryResult<void>> {
  return await saveResource({ data, create: false });
}

async function saveResource({ data, create }: SaveParams): Promise<RepositoryResult<void>> {
  return await withTransaction(async (tx) => {
    return await repositorySafe(async () => {
      const resources = resourcesCollection(tx);
      const edges = resourceEdgesCollection(tx);
      const parsed = ResourceSchemaUnion.parse(data);
      const id = parsed.id;
      const { namespace, type, name } = splitId.parse(parsed.id);
      const refs = extractResourceRefs(parsed);
      const document = createResourceDocumentSchema(type as ResourceType).parse({
        id,
        namespace,
        type,
        name,
        refs,
        data,
      });
      const now = new Date();

      if (create) {
        await resources.insertOne({
          ...document,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const result = await resources.updateOne({ id }, { $set: { ...document, updatedAt: now } }, { upsert: false });

        if (result.matchedCount === 0) throw new RepositoryNotFoundError();

        await edges.deleteMany({ from: id });
      }

      if (refs.length > 0) {
        await edges.insertMany(refs.map((ref) => ({ from: id, to: ref, type: 'reference' })));
      }
    });
  });
}

export async function getResource(id: string): Promise<RepositoryResult<any>> {
  return await execute(async (tx) => {
    return await repositorySafe(async () => {
      const resources = resourcesCollection(tx);
      const resource = await resources.findOne({ id });
      if (!resource) throw new RepositoryNotFoundError();

      return resource.data;
    });
  });
}

export async function findResources({ query, type, namespace, cursor, limit = 40 }: FindParams): Promise<
  RepositoryResult<{
    items: any[];
    hasMore: boolean;
    nextCursor?: string;
  }>
> {
  return await withTransaction(async (tx) => {
    return await repositorySafe(async () => {
      const resources = resourcesCollection(tx);
      const filter: Filter<any> = {};
      if (type) filter.type = type;

      if (namespace) filter.namespace = namespace;
      if (query) filter.id = { $regex: query, $options: 'i' };
      if (cursor) filter.id = { ...(filter.id ?? {}), $gt: cursor };
      const items = await resources
        .find(filter)
        .sort({ id: 1 })
        .limit(limit + 1)
        .map((row) => row.data)
        .toArray();
      const hasMore = items.length > limit;
      const sliced = items.slice(0, limit);

      return {
        items: sliced,
        hasMore,
        nextCursor: hasMore ? sliced.at(-1)?.id : undefined,
      };
    });
  });
}

export async function findIncomingReferences(id: string): Promise<RepositoryResult<any[]>> {
  return await execute(async (tx) => {
    return await repositorySafe(async () => {
      const edges = resourceEdgesCollection(tx);
      return edges.find({ to: id }).toArray();
    });
  });
}

export async function deleteResource(id: string): Promise<RepositoryResult<DeleteResult>> {
  return await withTransaction(async (tx) => {
    return await repositorySafe(async () => {
      const resources = resourcesCollection(tx);
      const edges = resourceEdgesCollection(tx);
      const result = await resources.deleteOne({ id });
      if (result.deletedCount === 0) throw new RepositoryNotFoundError();
      return await edges.deleteMany({
        $or: [{ from: id }, { to: id }],
      });
    });
  });
}
