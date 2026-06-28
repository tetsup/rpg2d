import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@sharedTypes/database/collection';
import { documentKey, getDocumentById, type DocumentCollection } from '@editor/hooks/api/by-id';

export function useResolvedDocument<T extends DocumentCollection>(
  collectionName: T,
  id?: string
): Database[T] | undefined {
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
