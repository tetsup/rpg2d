import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { fetchPostApi } from '@editor/lib/api/post';

type FilterInput<K extends keyof FilterMap> = {
  collectionName: K;
  query: FilterMap[K];
  cursor?: string;
};

export type GetDocumentListResponse<T> =
  | {
      items: T[];
      hasMore: true;
      nextCursor: string;
    }
  | { items: T[]; hasMore: false };

export async function getDocumentList<
  K extends keyof FilterMap,
  Req extends FilterInput<K> = any,
  Res extends Database[K] = any,
>(req: Req) {
  return await fetchPostApi<Req, GetDocumentListResponse<Res>>(`/api/${req.collectionName}/search`, req);
}

export function useDocumentList<K extends keyof FilterMap, Req extends FilterInput<K>>(params: Req) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: [params.collectionName, params.query],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await getDocumentList<K>({
        ...params,
        cursor: pageParam,
      });
      for (const item of response.items) {
        queryClient.setQueryData(item.id, item);
      }
      return response;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    maxPages: 5,
  });
}
