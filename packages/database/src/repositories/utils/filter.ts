import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { RepositoryResult } from './common';
import {
  clampDbFetchLimit,
  clampPageSize,
  CURSOR_PROBE_EXTRA_ROWS,
  FindOptions,
} from './limits';
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
  const pageSize = clampPageSize(chunkSize);
  const dbFetchLimit = clampDbFetchLimit(pageSize + CURSOR_PROBE_EXTRA_ROWS, 'cursor_probe');
  const mergedQuery = cursor === undefined ? query : [...query, createCursorFilter(cursor, sortKey)];
  const findOptions: FindOptions = { fetchMode: 'cursor_probe' };
  const result = await repository.find(mergedQuery, userId, sortKey, dbFetchLimit, findOptions);
  if (!result.ok) return result;
  const hasMore = result.data.length > pageSize;
  const items = result.data.slice(0, pageSize);
  return {
    ...result,
    data: {
      items,
      hasMore,
      nextCursor: hasMore ? getCursor(items.at(-1), sortKey) : undefined,
    },
  };
}
