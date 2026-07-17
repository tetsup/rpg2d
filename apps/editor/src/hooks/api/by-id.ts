import { useQuery } from '@tanstack/react-query';
import type { CollectionName, Database } from '@sharedTypes/database/collection';
import { fetchGetApi } from '@editor/lib/api/get';
import { isResourceCollection, toResourceApiPath } from '@editor/hooks/api/resource-id';

export function documentKey(collectionName: CollectionName, id: string) {
  return [collectionName, id] as const;
}

export function getDocumentApiPath(collectionName: CollectionName, id: string): string {
  if (isResourceCollection(collectionName)) {
    return toResourceApiPath(id);
  }
  return `/api/${collectionName}/${id}`;
}

export async function getDocumentById<K extends CollectionName>(collectionName: K, id: string): Promise<Database[K]> {
  return (await fetchGetApi(getDocumentApiPath(collectionName, id))) as Database[K];
}

export function useDocumentById<K extends CollectionName>(collectionName: K, id?: string) {
  return useQuery<Database[K]>({
    queryKey: documentKey(collectionName, id!),
    queryFn: () => getDocumentById(collectionName, id!),
    enabled: id != null,
  });
}
