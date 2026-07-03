import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@sharedTypes/database/collection';
import { documentKey, getDocumentById, type DocumentCollection } from '@editor/hooks/api/by-id';

export function useResolvedDocuments<T extends DocumentCollection>(
  collectionName: T,
  ids: readonly (string | null | undefined)[]
): (Database[T] | undefined)[] {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: documentKey(collectionName, id ?? ''),
      queryFn: () => getDocumentById(collectionName, id!),
      enabled: id != null,
      initialData: id ? queryClient.getQueryData<Database[T]>(documentKey(collectionName, id)) : undefined,
    })),
  });

  return results.map((result) => result.data);
}
