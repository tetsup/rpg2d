import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { CollectionName, DocumentMap } from '@sharedTypes/database/collection';
import { ResourceType } from '@sharedTypes/resource/common';
import { fetchPostApi } from '@editor/lib/api/post';
import { documentKey } from './by-id';

type Permission = 'read' | 'create' | 'update' | 'delete' | 'admin';

type ResourceListReqParams = {
  collectionName: 'resource';
  resourceType?: ResourceType;
  query: string;
};

type NamespaceListReqParams = {
  collectionName: 'namespace';
  permission?: Permission;
  query: string;
};

type UserListReqParams = {
  collectionName: 'user';
  query: string;
};

type DocumentListReqParams = {
  resource: ResourceListReqParams;
  namespace: NamespaceListReqParams;
  user: UserListReqParams;
};

function generateListQueryKey(params: DocumentListReqParams[CollectionName]) {
  switch (params.collectionName) {
    case 'namespace':
      return ['namespace-search', params.permission ?? 'all', params.query];
    case 'resource':
      return ['resource-search', params.resourceType ?? 'all', params.query];
    case 'user':
      return ['user-search', params.query];
    default:
      throw new Error('invalid collection name');
  }
}

const idExtractors: { [K in CollectionName]: (item: DocumentMap[K]) => string } = {
  namespace: (item) => item.id,
  resource: (item) => `${item.namespace}/${item.type}/${item.name}`,
  user: (item) => item.id,
};

function getIdFromDocument<K extends CollectionName>(collectionName: K, item: DocumentMap[K]): string {
  const extractor = idExtractors[collectionName];
  return extractor(item);
}

type GetDocumentListParams<K extends CollectionName> = DocumentListReqParams[K] & { cursor?: string };

export type GetDocumentListResponse<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
};

export async function getDocumentList<
  K extends CollectionName,
  Req extends GetDocumentListParams<K>,
  Res extends DocumentMap[K],
>(req: Req) {
  return await fetchPostApi<Req, GetDocumentListResponse<Res>>(`/api/${req.collectionName}/search`, {
    ...req,
    limit: '40',
  });
}

export function useDocumentList<
  K extends CollectionName,
  Req extends GetDocumentListParams<K> = any,
  Res extends GetDocumentListResponse<DocumentMap[K]> = any,
>(params: Req) {
  const queryKey = generateListQueryKey(params);
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await getDocumentList({
        ...params,
        cursor: pageParam,
      });
      for (const item of response.items) {
        queryClient.setQueryData(
          documentKey(params.collectionName, getIdFromDocument(params.collectionName, item)),
          item
        );
      }
      return response as Res;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    maxPages: 5,
  });
}
