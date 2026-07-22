import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CollectionName, Database } from '@sharedTypes/database/collection';
import { documentKey, getDocumentById } from '../hooks/by-id';

export function useResolvedDocument<T extends CollectionName>(collectionName: T, id?: string): Database[T] | undefined {
  const queryClient = useQueryClient();
  const cached = id ? queryClient.getQueryData<Database[T]>(documentKey(collectionName, id)) : undefined;

  const { data: fetched } = useQuery({
    queryKey: documentKey(collectionName, id!),
    queryFn: () => getDocumentById(collectionName, id!),
    enabled: id != null && cached == null,
    initialData: cached,
  });

  return cached ?? fetched;
}
