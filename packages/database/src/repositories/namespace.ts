import type { Kysely } from 'kysely';
import type { Database } from '@sharedTypes/database/collection';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { NamespacePermissionInputSchema } from '@schema/database/namespace-permission';
import { NamespaceFilterSchema } from '@schema/filter/domain';
import { resolveNamespaceCapabilities } from '@schema/database/namespace-capabilities';
import { execute, withTransaction } from '@database/client/pg-client';
import { applyNamespaceFilter } from '@database/filters/namespace';
import { repositorySafe } from './utils/common';
import { FindOptions, resolveDbFetchLimit } from './utils/limits';

type NamespaceRepositoryOptions = {
  mockDb?: Kysely<Database>;
  mockNamespaceSchema?: typeof NamespaceInputSchema;
  mockPermissionSchema?: typeof NamespacePermissionInputSchema;
};

export class NamespaceRepository {
  private dbFactory: (real: Kysely<Database>) => Kysely<Database>;
  private namespaceSchema: typeof NamespaceInputSchema;
  private permissionSchema: typeof NamespacePermissionInputSchema;

  constructor({ mockDb, mockNamespaceSchema, mockPermissionSchema }: NamespaceRepositoryOptions = {}) {
    this.dbFactory = mockDb ? () => mockDb : (db) => db;
    this.namespaceSchema = mockNamespaceSchema ?? NamespaceInputSchema;
    this.permissionSchema = mockPermissionSchema ?? NamespacePermissionInputSchema;
  }

  async get(id: string) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const namespace = await conn
          .selectFrom('namespaces')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirstOrThrow();
        return namespace;
      });
    });
  }

  async create(namespace: any, userId: string) {
    return repositorySafe(async () => {
      const parsed = this.namespaceSchema.parse(namespace);
      const now = new Date();
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        const res = await conn
          .insertInto('namespaces')
          .values({
            ...parsed,
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        await conn
          .insertInto('namespace_permissions')
          .values({
            namespaceId: parsed.id,
            userId,
            permission: 'owner',
            createdAt: now,
            updatedAt: now,
          })
          .execute();
        return res;
      });
    });
  }

  async update(id: string, namespace: any) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const parsed = this.namespaceSchema.parse(namespace);
        const updated = await conn
          .updateTable('namespaces')
          .set({
            ...parsed,
            updatedAt: new Date(),
          })
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirstOrThrow();

        await conn
          .updateTable('namespace_permissions')
          .set({
            namespaceId: parsed.id,
          })
          .where('namespaceId', '=', id)
          .execute();
        return updated;
      });
    });
  }

  async delete(id: string) {
    return repositorySafe(async () => {
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        await conn.deleteFrom('namespaces').where('id', '=', id).returningAll().executeTakeFirstOrThrow();
        await conn.deleteFrom('namespace_permissions').where('namespaceId', '=', id).execute();
      });
    });
  }

  async addPermission(params: any) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const member = this.permissionSchema.parse(params);
        const now = new Date();
        await conn
          .insertInto('namespace_permissions')
          .values({
            ...member,
            createdAt: now,
            updatedAt: now,
          })
          .execute();
      });
    });
  }

  async removePermission({ namespaceId, userId }: any) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        await conn
          .deleteFrom('namespace_permissions')
          .where('namespaceId', '=', namespaceId)
          .where('userId', '=', userId)
          .returningAll()
          .executeTakeFirstOrThrow();
      });
    });
  }

  async isMember({ namespaceId, userId }: any) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const res = await conn
          .selectFrom('namespace_permissions')
          .select('userId')
          .where('namespaceId', '=', namespaceId)
          .where('userId', '=', userId)
          .executeTakeFirst();
        return !!res;
      });
    });
  }

  async findPermissions(namespaceId: string) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        return conn
          .selectFrom('namespace_permissions')
          .selectAll()
          .where('namespaceId', '=', namespaceId)
          .orderBy('userId', 'asc')
          .execute();
      });
    });
  }

  async find(query: any, userId: string, sortKey: string, limit?: number, options?: FindOptions) {
    return repositorySafe(async () => {
      const parsed = NamespaceFilterSchema.parse(query);
      const dbFetchLimit = resolveDbFetchLimit(limit, options);
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const own = conn
          .selectFrom('namespaces')
          .selectAll()
          .where((eb) =>
            eb.or([
              eb('isPrivate', '=', false),
              eb.exists(
                conn
                  .selectFrom('namespace_permissions')
                  .select('userId')
                  .whereRef('namespace_permissions.namespaceId', '=', eb.ref('namespaces.id'))
                  .where('userId', '=', userId)
              ),
            ])
          );
        const rows = applyNamespaceFilter(own, parsed).orderBy(sortKey).limit(dbFetchLimit).execute();
        return rows;
      });
    });
  }

  async checkPermissions({ namespaceId, userId }: { namespaceId: string; userId: string }) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const permissions = await conn
          .selectFrom('namespace_permissions')
          .select('permission')
          .where('namespaceId', '=', namespaceId)
          .where('userId', '=', userId)
          .execute();
        return resolveNamespaceCapabilities(permissions.map((permission) => permission.permission));
      });
    });
  }
}
