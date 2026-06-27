import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { calcLimit, RepositoryResult } from './common';
import { NamespaceRepository } from '../namespace';
import { ResourceRepository } from '../resource';
import { UserRepository } from '../user';

export type CursorPage<T, C> = {
  items: T[];
  hasMore: boolean;
  nextCursor?: C;
};

type FindWithCursorParams<K extends keyof FilterMap, S extends keyof Database[K]> = {
  repository: RepositoryMap[K];
  query: FilterMap[K][];
  userId: string;
  sortKey: S;
  cursor?: Database[K][S];
  chunkSize: number;
};

type RepositoryMap = {
  namespaces: NamespaceRepository;
  resources: ResourceRepository;
  users: UserRepository;
};

function createCursorFilter<K extends keyof FilterMap, S extends keyof Database[K]>(
  cursor: Database[K][S],
  sortKey: S
) {
  return { name: sortKey, op: 'gt', value: cursor };
}

function getCursor<K extends keyof FilterMap>(lastRow: Database[K], sortKey: keyof Database[K]) {
  return lastRow[sortKey];
}

export async function findWithCursor<K extends keyof FilterMap>({
  repository,
  query,
  userId,
  sortKey,
  cursor,
  chunkSize,
}: FindWithCursorParams<K, any>): Promise<RepositoryResult<CursorPage<Database[K], Database[K][any]>>> {
  const limit = calcLimit(chunkSize + 1) - 1;
  const mergedQuery = cursor === undefined ? query : [...query, createCursorFilter(cursor, sortKey)];
  const result = await repository.find(mergedQuery, userId, sortKey, limit + 1);
  if (!result.ok) return result;
  const hasMore = result.data.length > limit;
  const items = result.data.slice(0, limit);
  return {
    ...result,
    data: {
      items,
      hasMore,
      nextCursor: hasMore ? getCursor(items.at(-1), sortKey) : undefined,
    },
  };
}
