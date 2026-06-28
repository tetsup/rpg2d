import { useInfiniteQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { fetchPostApi } from '@editor/lib/api/post';
import { documentKey, type DocumentCollection } from '@editor/hooks/api/by-id';

export type SearchRequest<K extends DocumentCollection> = {
  query: FilterMap[K][];
  cursor?: string;
};

export type SearchParams<K extends DocumentCollection> = {
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

export function listKey<K extends DocumentCollection>(collectionName: K, query: FilterMap[K][]) {
  return [collectionName, query] as const;
}

export function invalidateDocumentLists(
  queryClient: QueryClient,
  collectionName: DocumentCollection
) {
  return queryClient.invalidateQueries({ queryKey: [collectionName] });
}

export async function getDocumentList<K extends DocumentCollection>(
  collectionName: K,
  body: SearchRequest<K>
) {
  return await fetchPostApi<SearchRequest<K>, GetDocumentListResponse<Database[K]>>(
    `/api/${collectionName}/search`,
    body
  );
}

export function useDocumentList<K extends DocumentCollection>(params: SearchParams<K>) {
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
