import type { NamespaceDocument, NamespacePermissionDocument, UserDocument, WithTimestamp } from '@sharedTypes/database/collection';
import type { ResourcePath } from '@sharedTypes/resource/common';
import { execute } from '@database/client/pg-client';
import { buildId } from '@database/utils/resource';

export const ownerPermission = 'owner' as const;
export const editorPermission = 'editor' as const;
export const creatorPermission = 'creator' as const;
export const memberPermission = 'reader' as const;

export function createUserInput(overrides: Partial<UserDocument> = {}): UserDocument {
  return {
    id: 'auth0|user',
    presenceName: 'Test User',
    email: 'user@example.com',
    avatar: 'https://example.com/avatar.png',
    isAdmin: false,
    ...overrides,
  };
}

export async function insertUser(overrides: Partial<UserDocument> = {}) {
  const user = createUserInput(overrides);
  const now = new Date();

  await execute(async (db) => {
    await db
      .insertInto('users')
      .values({
        ...user,
        createdAt: now,
        updatedAt: now,
      })
      .execute();
  });

  return user;
}

export function createNamespaceInput(
  overrides: Partial<NamespaceDocument> = {}
): WithTimestamp<NamespaceDocument> {
  const now = new Date();

  return {
    id: 'sample',
    presenceName: 'Sample',
    description: '',
    isPrivate: false,
    createdBy: 'dummy-user',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export async function insertNamespace(overrides: Partial<NamespaceDocument> = {}) {
  const namespace = createNamespaceInput(overrides);

  await execute(async (db) => {
    await db
      .insertInto('namespaces')
      .values({
        id: namespace.id,
        presenceName: namespace.presenceName,
        description: namespace.description,
        isPrivate: namespace.isPrivate,
        createdBy: namespace.createdBy,
        createdAt: namespace.createdAt,
        updatedAt: namespace.updatedAt,
      })
      .execute();
  });

  return namespace;
}

export function createPermissionInput(
  namespaceId: string,
  userId: string,
  permission: NamespacePermissionDocument['permission'] = memberPermission
): NamespacePermissionDocument {
  return {
    namespaceId,
    userId,
    permission,
  };
}

export async function insertPermission(
  namespaceId: string,
  userId: string,
  permission: NamespacePermissionDocument['permission'] = memberPermission
) {
  const now = new Date();
  const member = createPermissionInput(namespaceId, userId, permission);

  await execute(async (db) => {
    await db
      .insertInto('namespace_permissions')
      .values({
        ...member,
        createdAt: now,
        updatedAt: now,
      })
      .execute();
  });

  return member;
}

export const validPlayerPath = {
  namespace: 'sample',
  type: 'player',
  name: 'hero',
} as ResourcePath;

export const validPlayerData = {
  name: {
    type: 'fixed',
    value: 'hero',
  },
  initialSkin: 'sample/skin/hero',
  initialState: {
    hp: 100,
  },
} as const;

export function createPlayerDocument(path: ResourcePath = validPlayerPath, data = validPlayerData) {
  return {
    id: buildId(path),
    namespace: path.namespace,
    type: path.type,
    name: path.name,
    version: 0 as const,
    isValid: true as const,
    description: 'this is resource',
    data,
  };
}

export async function insertResourceRow(
  path: ResourcePath,
  data: object,
  options: { description?: string; isValid?: boolean; createdBy?: string } = {}
) {
  const now = new Date();
  const id = buildId(path);

  await execute(async (db) => {
    await db
      .insertInto('resources')
      .values({
        id,
        namespace: path.namespace,
        type: path.type,
        name: path.name,
        version: 0,
        description: options.description ?? '',
        isValid: options.isValid ?? true,
        data,
        createdBy: options.createdBy ?? 'dummy-user',
        createdAt: now,
        updatedAt: now,
      })
      .execute();
  });

  return { id, path, data };
}

export async function insertResource(path: ResourcePath = validPlayerPath, data = validPlayerData, options: { createdBy?: string } = {}) {
  return insertResourceRow(path, data, options);
}

const minimalImageData = {
  size: { width: 1, height: 1 },
  palette: { aa: [0, 0, 0, 255] },
  pixels: ['aa'],
};

export async function insertSkinResource(namespace: string, skinName: string, imagePrefix = skinName) {
  const directions = ['left', 'right', 'up', 'down'] as const;

  for (const direction of directions) {
    await insertResourceRow({ namespace, type: 'image', name: `${imagePrefix}-${direction}` }, minimalImageData);
  }

  await insertResourceRow(
    { namespace, type: 'skin', name: skinName },
    {
      textures: {
        left: `${namespace}/image/${imagePrefix}-left`,
        right: `${namespace}/image/${imagePrefix}-right`,
        up: `${namespace}/image/${imagePrefix}-up`,
        down: `${namespace}/image/${imagePrefix}-down`,
      },
    }
  );
}

export async function insertSkinDependencies(namespace = 'sample', skinName = 'hero') {
  await insertSkinResource(namespace, skinName);
}

export async function insertPlayerWithDependencies(path: ResourcePath = validPlayerPath) {
  await insertSkinDependencies(path.namespace, 'hero');
  return insertResource(path, validPlayerData);
}

export async function insertResourceEdge(from: string, to: string, type = 'reference') {
  await execute(async (db) => {
    await db.insertInto('resource_edges').values({ from, to, type }).execute();
  });
}
