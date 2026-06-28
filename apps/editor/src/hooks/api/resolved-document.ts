import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { documentKey, getDocumentById } from '@editor/hooks/api/by-id';

export function useResolvedDocument<T extends keyof FilterMap>(
  collectionName: T,
  id?: string
): Database[T] | undefined {
  const queryClient = useQueryClient();
  const cached = id ? queryClient.getQueryData<Database[T]>(documentKey(collectionName, id)) : undefined;

  const { data: fetched } = useQuery({
    queryKey: documentKey(collectionName, id!),
    queryFn: () => getDocumentById<Database[T]>(collectionName, id!),
    enabled: id != null && cached == null,
    initialData: cached,
  });

  return cached ?? fetched;
}
