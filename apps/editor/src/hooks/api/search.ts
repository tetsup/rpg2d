import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { CollectionName, DocumentMap } from '@sharedTypes/database/collection';
import type { DocumentFilterInput } from '@sharedTypes/database/repository';
import { fetchPostApi } from '@editor/lib/api/post';
import { documentKey } from './by-id';

const idExtractors: { [K in CollectionName]: (item: DocumentMap[K]) => string } = {
  namespace: (item) => item.id,
  resource: (item) => `${item.namespace}/${item.type}/${item.name}`,
  user: (item) => item.id,
};

function getIdFromDocument<K extends CollectionName>(collectionName: K, item: DocumentMap[K]): string {
  const extractor = idExtractors[collectionName];
  return extractor(item);
}
type FilterInput<K extends CollectionName> = {
  collectionName: K;
  query: DocumentFilterInput[K];
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
  K extends CollectionName,
  Req extends FilterInput<K> = any,
  Res extends DocumentMap[K] = any,
>(req: Req) {
  return await fetchPostApi<Req, GetDocumentListResponse<Res>>(`/api/${req.collectionName}/search`, req);
}

export function useDocumentList<K extends CollectionName, Req extends FilterInput<K>>(params: Req) {
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
        queryClient.setQueryData(
          documentKey(params.collectionName, getIdFromDocument(params.collectionName, item)),
          item
        );
      }
      return response;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    maxPages: 5,
  });
}
