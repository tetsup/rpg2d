import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { Database, DatabaseInput } from '@sharedTypes/database/collection';
import { queryClient } from '@editor/stores/query-client';
import { fetchDeleteApi } from '../api/delete';
import { fetchGetApi } from '../api/get';
import { fetchPostApi } from '../api/post';
import { fetchPutApi } from '../api/put';

type SearchRequest<TQuery> = {
  query: TQuery;
  cursor?: string;
};

type SearchResponse<TRecord> =
  | {
      items: TRecord[];
      hasMore: true;
      nextCursor: string;
    }
  | {
      items: TRecord[];
      hasMore: false;
    };

export type RepositoryOptions = {
  key: string;
  basePath: string;
};

export function createRepository<
  K extends keyof FilterMap,
  TInput extends DatabaseInput[K] = any,
  TRecord extends Database[K] = any,
  TQuery extends FilterMap[K][] = any,
>({ key, basePath }: RepositoryOptions) {
  const byIdQueryKey = (id: string) => [key, 'byId', id];

  async function getById(id: string): Promise<TRecord> {
    return queryClient.fetchQuery({
      queryKey: byIdQueryKey(id),
      queryFn: () => fetchGetApi<{}, TRecord>(`${basePath}/${id}`),
    });
  }

  function useById(id: string) {
    const byIdPath = `${basePath}/${id}`;
    return useQuery({
      queryKey: [key, 'byId', id],
      queryFn: () => fetchGetApi<{}, TRecord>(byIdPath),
    });
  }

  async function create(input: TInput): Promise<TRecord> {
    const res = (await fetchPostApi<TInput, TRecord>(basePath, input)) as TRecord;
    queryClient.setQueryData([key, 'byId', res.id], res);
    await queryClient.invalidateQueries({
      queryKey: [key, 'search'],
    });
    return res;
  }

  async function update(id: string, input: TInput): Promise<TRecord> {
    const res = await fetchPutApi<TInput, TRecord>(`${basePath}/${id}`, input);
    if (res.id !== id) {
      queryClient.removeQueries({
        queryKey: [key, 'byId', id],
        exact: true,
      });
    }
    await queryClient.setQueryData([key, 'byId', res.id], res);
    await queryClient.invalidateQueries({
      queryKey: [key, 'search'],
    });
    return res;
  }

  async function remove(id: string): Promise<void> {
    await fetchDeleteApi(`${basePath}/${id}`);
    queryClient.removeQueries({
      queryKey: [key, 'byId', id],
      exact: true,
    });
    await queryClient.invalidateQueries({
      queryKey: [key, 'search'],
    });
  }

  function useInfiniteSearch(query: TQuery) {
    return useInfiniteQuery({
      queryKey: [key, 'search', query],
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam }) =>
        fetchPostApi<SearchRequest<TQuery>, SearchResponse<TRecord>>(`${basePath}/search`, {
          query,
          cursor: pageParam,
        }),
      getNextPageParam: (page) => (page.hasMore ? page.nextCursor : undefined),
    });
  }

  return {
    getById,
    useById,
    create,
    update,
    remove,
    useInfiniteSearch,
  };
}
