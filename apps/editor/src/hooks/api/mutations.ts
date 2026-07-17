import { useMutation } from '@tanstack/react-query';
import type { CollectionName, Database, DatabaseInput } from '@sharedTypes/database/collection';
import { fetchDeleteApi } from '@editor/lib/api/delete';
import { fetchPostApi } from '@editor/lib/api/post';
import { fetchPutApi } from '@editor/lib/api/put';
import { queryClient } from '@editor/lib/query-client';
import { formatResourceId } from '@schema/resource/common/base';
import { documentKey, getDocumentApiPath } from '@editor/hooks/api/by-id';
import { isResourceCollection, toResourceApiPath } from '@editor/hooks/api/resource-id';
import { invalidateDocumentLists } from '@editor/hooks/api/search';

function resolveDocumentId<K extends CollectionName>(collectionName: K, body: DatabaseInput[K]): string {
  if (isResourceCollection(collectionName)) {
    const input = body as DatabaseInput['resources'];
    return formatResourceId({
      namespace: input.namespace,
      type: input.type,
      name: input.name,
    });
  }
  return (body as { id: string }).id;
}

function getCreateApiPath<K extends CollectionName>(collectionName: K, body: DatabaseInput[K]): string {
  if (isResourceCollection(collectionName)) {
    return toResourceApiPath(resolveDocumentId(collectionName, body));
  }
  return `/api/${collectionName}`;
}

export async function createDocument<K extends CollectionName>(
  collectionName: K,
  input: DatabaseInput[K]
): Promise<void> {
  const apiPath = getCreateApiPath(collectionName, input);
  const res = await fetchPostApi<DatabaseInput[K], Database[K]>(apiPath, input);
  const id = resolveDocumentId(collectionName, res);
  queryClient.setQueryData(documentKey(collectionName, id), res);
  await invalidateDocumentLists(queryClient, collectionName);
}

export async function updateDocument<K extends CollectionName>(
  collectionName: K,
  id: string,
  input: DatabaseInput[K]
): Promise<void> {
  const apiPath = getCreateApiPath(collectionName, input);
  const res = await fetchPutApi<DatabaseInput[K], Database[K]>(apiPath, input);
  const newId = resolveDocumentId(collectionName, res);
  if (id !== newId) {
    queryClient.removeQueries({
      queryKey: documentKey(collectionName, id),
      exact: true,
    });
  }
  queryClient.setQueryData(documentKey(collectionName, newId), res);
  await invalidateDocumentLists(queryClient, collectionName);
}

export async function deleteDocument<K extends CollectionName>(collectionName: K, id: string): Promise<void> {
  await fetchDeleteApi(getDocumentApiPath(collectionName, id));
  queryClient.removeQueries({ queryKey: documentKey(collectionName, id), exact: true });
  await invalidateDocumentLists(queryClient, collectionName);
}

export function useCreateDocument<K extends CollectionName>(collectionName: K) {
  return useMutation({
    mutationFn: (body: DatabaseInput[K]) => createDocument(collectionName, body),
  });
}

export function useUpdateDocument<K extends CollectionName>(collectionName: K) {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DatabaseInput[K] }) => updateDocument(collectionName, id, body),
  });
}

export function useDeleteDocument<K extends CollectionName>(collectionName: K) {
  return useMutation({
    mutationFn: (id: string) => deleteDocument(collectionName, id),
  });
}
