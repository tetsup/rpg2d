import { resourcesCollection } from '../collections/resources';
import { resourceEdgesCollection } from '../collections/resource-edges';
import { usersCollection } from '../collections/users';
import { namespacesCollection } from '../collections/namespaces';
import { namespaceMembersCollection } from '../collections/namespace-members';
import { execute } from '@database/client/mongo-client';

export async function ensureIndexes() {
  await execute(async (tx) => {
    const resources = resourcesCollection(tx);
    await resources.createIndexes([
      {
        key: {
          id: 1,
        },
        unique: true,
      },
      {
        key: {
          namespace: 1,
          type: 1,
        },
      },
      {
        key: {
          updatedAt: -1,
        },
      },
      {
        key: {
          refs: 1,
        },
      },
    ]);

    const edges = resourceEdgesCollection(tx);
    await edges.createIndexes([
      {
        key: {
          from: 1,
        },
      },
      {
        key: {
          to: 1,
        },
      },
    ]);

    const users = usersCollection(tx);
    await users.createIndexes([
      {
        key: {
          auth0Id: 1,
        },
        unique: true,
      },
    ]);

    const namespaces = namespacesCollection(tx);
    await namespaces.createIndexes([
      {
        key: {
          id: 1,
        },
        unique: true,
      },
    ]);

    const members = namespaceMembersCollection(tx);
    await members.createIndexes([
      {
        key: {
          namespaceId: 1,
          userId: 1,
        },
        unique: true,
      },
      {
        key: {
          userId: 1,
        },
      },
    ]);
  });
}
