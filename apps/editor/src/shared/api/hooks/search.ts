import { useInfiniteQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { CollectionName, Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { fetchPostApi } from '../lib/post';
import { documentKey } from '../hooks/by-id';

export type SearchRequest<K extends keyof FilterMap> = {
  query: FilterMap[K][];
  cursor?: string;
};

export type SearchParams<K extends keyof FilterMap> = {
  collectionName: K;
  query: FilterMap[K][];
};

export type GetDocumentListResponse<T> =
  | {
      items: T[];
      hasMore: true;
      nextCursor: string;
    }
  | { items: T[]; hasMore: false };

export function listKey<K extends keyof FilterMap>(collectionName: K, query: FilterMap[K][]) {
  return [collectionName, query] as const;
}

export function invalidateDocumentLists(queryClient: QueryClient, collectionName: CollectionName) {
  return queryClient.invalidateQueries({ queryKey: [collectionName] });
}

export async function getDocumentList<K extends keyof FilterMap>(collectionName: K, body: SearchRequest<K>) {
  return await fetchPostApi<SearchRequest<K>, GetDocumentListResponse<Database[K]>>(
    `/api/${collectionName}/search`,
    body
  );
}

export function useDocumentList<K extends keyof FilterMap>(params: SearchParams<K>) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: listKey(params.collectionName, params.query),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await getDocumentList(params.collectionName, {
        query: params.query,
        cursor: pageParam,
      });
      for (const item of response.items) {
        queryClient.setQueryData(documentKey(params.collectionName, item.id), item);
      }
      return response;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    maxPages: 5,
  });
}
