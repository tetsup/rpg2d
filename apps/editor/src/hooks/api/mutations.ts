import { useMutation } from '@tanstack/react-query';
import type { Database, DatabaseInput } from '@sharedTypes/database/collection';
import { fetchDeleteApi } from '@editor/lib/api/delete';
import { fetchPostApi } from '@editor/lib/api/post';
import { fetchPutApi } from '@editor/lib/api/put';
import { queryClient } from '@editor/lib/query-client';
import { formatResourceId } from '@schema/resource/common/base';
import { documentKey, getDocumentApiPath, type DocumentCollection } from '@editor/hooks/api/by-id';
import { isResourceCollection, toResourceApiPath } from '@editor/hooks/api/resource-id';
import { invalidateDocumentLists } from '@editor/hooks/api/search';

function resolveDocumentId<K extends DocumentCollection>(
  collectionName: K,
  body: DatabaseInput[K]
): string {
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

function getCreateApiPath<K extends DocumentCollection>(
  collectionName: K,
  body: DatabaseInput[K]
): string {
  if (isResourceCollection(collectionName)) {
    return toResourceApiPath(resolveDocumentId(collectionName, body));
  }
  return `/api/${collectionName}`;
}

export async function createDocument<K extends DocumentCollection>(
  collectionName: K,
  body: DatabaseInput[K]
): Promise<void> {
  await fetchPostApi(getCreateApiPath(collectionName, body), body);
  const id = resolveDocumentId(collectionName, body);
  queryClient.setQueryData(documentKey(collectionName, id), {
    id,
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '',
  } as Database[K]);
  await invalidateDocumentLists(queryClient, collectionName);
}

export async function updateDocument<K extends DocumentCollection>(
  collectionName: K,
  id: string,
  body: DatabaseInput[K]
): Promise<void> {
  await fetchPutApi(getDocumentApiPath(collectionName, id), body);
  queryClient.setQueryData(documentKey(collectionName, id), (old: Database[K] | undefined) => ({
    ...old,
    ...body,
    id,
  }));
  await invalidateDocumentLists(queryClient, collectionName);
}

export async function deleteDocument<K extends DocumentCollection>(
  collectionName: K,
  id: string
): Promise<void> {
  await fetchDeleteApi(getDocumentApiPath(collectionName, id));
  queryClient.removeQueries({ queryKey: documentKey(collectionName, id) });
  await invalidateDocumentLists(queryClient, collectionName);
}

export function useCreateDocument<K extends DocumentCollection>(collectionName: K) {
  return useMutation({
    mutationFn: (body: DatabaseInput[K]) => createDocument(collectionName, body),
  });
}

export function useUpdateDocument<K extends DocumentCollection>(collectionName: K) {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DatabaseInput[K] }) =>
      updateDocument(collectionName, id, body),
  });
}

export function useDeleteDocument<K extends DocumentCollection>(collectionName: K) {
  return useMutation({
    mutationFn: (id: string) => deleteDocument(collectionName, id),
  });
}
