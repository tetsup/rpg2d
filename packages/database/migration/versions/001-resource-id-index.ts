import { resourceCollectionBuilder } from '@database/collections/resources';
import { resourceEdgeCollectionBuilder } from '@database/collections/resource-edges';
import { userCollectionBuilder } from '@database/collections/users';
import { namespaceCollectionBuilder } from '@database/collections/namespaces';
import { namespaceMemberCollectionBuilder } from '@database/collections/namespace-members';
import { hasIndex } from '../utils/verify';
import type { Migration } from '../types';

export const migration001: Migration = {
  version: 1,
  name: 'resource-id-unique-index',
  type: 'index',
  transactional: false,

  async up(tx) {
    const resources = resourceCollectionBuilder(tx);
    await resources.createIndexes([
      { key: { id: 1 }, unique: true },
      { key: { namespace: 1, type: 1 } },
      { key: { updatedAt: -1 } },
      { key: { refs: 1 } },
    ]);

    const edges = resourceEdgeCollectionBuilder(tx);
    await edges.createIndexes([{ key: { from: 1 } }, { key: { to: 1 } }]);

    const users = userCollectionBuilder(tx);
    await users.createIndexes([{ key: { auth0Id: 1 }, unique: true }]);

    const namespaces = namespaceCollectionBuilder(tx);
    await namespaces.createIndexes([{ key: { id: 1 }, unique: true }]);

    const members = namespaceMemberCollectionBuilder(tx);
    await members.createIndexes([{ key: { namespaceId: 1, userId: 1 }, unique: true }, { key: { userId: 1 } }]);
  },

  async verify(tx) {
    const resourceIndexes = await resourceCollectionBuilder(tx).indexes();

    if (!hasIndex(resourceIndexes, { id: 1 }, { unique: true })) {
      throw new Error('resources.id unique index missing');
    }

    if (!hasIndex(resourceIndexes, { namespace: 1, type: 1 })) {
      throw new Error('resources.namespace_type index missing');
    }

    if (!hasIndex(resourceIndexes, { updatedAt: -1 })) {
      throw new Error('resources.updatedAt index missing');
    }

    if (!hasIndex(resourceIndexes, { refs: 1 })) {
      throw new Error('resources.refs index missing');
    }

    const edgeIndexes = await resourceEdgeCollectionBuilder(tx).indexes();

    if (!hasIndex(edgeIndexes, { from: 1 })) {
      throw new Error('resource_edges.from index missing');
    }

    if (!hasIndex(edgeIndexes, { to: 1 })) {
      throw new Error('resource_edges.to index missing');
    }

    const userIndexes = await userCollectionBuilder(tx).indexes();

    if (!hasIndex(userIndexes, { auth0Id: 1 }, { unique: true })) {
      throw new Error('users.auth0Id unique index missing');
    }

    const namespaceIndexes = await namespaceCollectionBuilder(tx).indexes();

    if (!hasIndex(namespaceIndexes, { id: 1 }, { unique: true })) {
      throw new Error('namespaces.id unique index missing');
    }

    const memberIndexes = await namespaceMemberCollectionBuilder(tx).indexes();

    if (!hasIndex(memberIndexes, { namespaceId: 1, userId: 1 }, { unique: true })) {
      throw new Error('namespace_members.namespaceId_userId unique index missing');
    }

    if (!hasIndex(memberIndexes, { userId: 1 })) {
      throw new Error('namespace_members.userId index missing');
    }
  },
};
