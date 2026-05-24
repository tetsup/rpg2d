import { useInfiniteQuery } from '@tanstack/react-query';
import { ResourceType } from '@sharedTypes/resource/common';
import { getResourceList } from '../../lib/get-resource-list';

type Params = {
  query: string;
  type?: ResourceType;
};

export function useResourceList({ query, type }: Params) {
  return useInfiniteQuery({
    queryKey: [
      'resources',
      {
        query,
        type,
      },
    ],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getResourceList({
        query,
        type,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    maxPages: 5,
  });
}
