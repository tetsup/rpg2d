import { Collection } from 'mongodb';
import { ResourceType } from '@sharedTypes/resource/common';
import { db } from './infra';

export type ResourceDocument = {
  id: string;
  type: ResourceType;
  name: string;
  searchableName: string;
};

export type ListResourcesParams = {
  query: string;
  type?: ResourceType;
  cursor?: string;
  limit: number;
};

export type ListResourcesResult = {
  items: ResourceDocument[];
  nextCursor?: string;
  hasMore: boolean;
};

function getCollection(): Collection<ResourceDocument> {
  return db.collection<ResourceDocument>('resources');
}

export const resourceRepository = {
  async list({ query, type, cursor, limit }: ListResourcesParams): Promise<ListResourcesResult> {
    const collection = getCollection();
    const filter = {
      ...(type && {
        type,
      }),
      ...(query && {
        searchableName: {
          $regex: escapeRegex(query.toLowerCase()),
          $options: 'i',
        },
      }),
      ...(cursor && {
        id: {
          $gt: cursor,
        },
      }),
    };
    const rows = await collection
      .find(filter)
      .sort({
        id: 1,
      })
      .limit(limit + 1)
      .toArray();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  },
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
