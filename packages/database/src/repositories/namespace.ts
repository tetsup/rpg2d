import { execute } from '@database/client/mongo-client';
import { namespacesCollection } from '../collections/namespaces';

type CreateNamespaceParams = {
  id: string;
  displayName: string;
  createdBy: string;
};

export async function findNamespaceById(id: string) {
  return await execute(async (tx) => {
    const namespaces = namespacesCollection(tx);
    return await namespaces.findOne({
      id,
    });
  });
}

export async function createNamespace({ id, displayName, createdBy }: CreateNamespaceParams) {
  return await execute(async (tx) => {
    const namespaces = namespacesCollection(tx);
    const now = new Date();
    return await namespaces.insertOne({
      id,
      displayName,
      createdBy,
      createdAt: now,
      updatedAt: now,
    });
  });
}
