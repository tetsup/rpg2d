import { useQuery } from '@tanstack/react-query';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { fetchGetApi } from '@editor/lib/api/get';
import { isResourceCollection, toResourceApiPath } from '@editor/hooks/api/resource-id';

export type DocumentCollection = keyof FilterMap;

export function documentKey(collectionName: DocumentCollection, id: string) {
  return [collectionName, id] as const;
}

export function getDocumentApiPath(collectionName: DocumentCollection, id: string): string {
  if (isResourceCollection(collectionName)) {
    return toResourceApiPath(id);
  }
  return `/api/${collectionName}/${id}`;
}

export async function getDocumentById<K extends DocumentCollection>(
  collectionName: K,
  id: string
): Promise<Database[K]> {
  return (await fetchGetApi(getDocumentApiPath(collectionName, id))) as Database[K];
}

export function useDocumentById<K extends DocumentCollection>(collectionName: K, id?: string) {
  return useQuery<Database[K]>({
    queryKey: documentKey(collectionName, id!),
    queryFn: () => getDocumentById(collectionName, id!),
    enabled: id != null,
  });
}
