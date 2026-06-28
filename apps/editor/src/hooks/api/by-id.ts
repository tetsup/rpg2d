import { useQuery } from '@tanstack/react-query';
import { CollectionName } from '@sharedTypes/database/collection';
import { fetchGetApi } from '@editor/lib/api/get';

export function documentKey(collectionName: CollectionName, id: string) {
  return [collectionName, id];
}

async function getDocumentById<T>(collectionName: CollectionName, id: string) {
  return (await fetchGetApi(`/api/${collectionName}/${id}`)) as T;
}

export function useDocumentById<T>(collectionName: CollectionName, id?: string) {
  return useQuery<T>({
    queryKey: documentKey(collectionName, id!),
    queryFn: () => getDocumentById<T>(collectionName, id!),
    enabled: id != null,
  });
}
