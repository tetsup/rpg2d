import { Kysely } from 'kysely';
import type { ResourcePath } from '@sharedTypes/resource/common';
import type { Database, ResourceDocument, ResourceInput } from '@sharedTypes/database/collection';
import { createResourceInputSchema } from '@schema/database/resource';
import { ResourceFilterSchema } from '@schema/filter/domain';
import { formatResourceId } from '@schema/resource/common/base';
import { extractResourceRefs } from '@database/utils/resource';
import { execute, withTransaction } from '@database/client/pg-client';
import { applyResourceFilter } from '@database/filters/resource';
import { repositorySafe } from './utils/common';
import { type FindOptions, resolveDbFetchLimit } from './utils/limits';

type ResourceRepositoryOptions = {
  mockDb?: Kysely<Database>;
  mockResourceInputSchema?: typeof createResourceInputSchema;
};

export function getPath(meta: Pick<ResourceDocument, 'namespace' | 'type' | 'name'>) {
  return { namespace: meta.namespace, type: meta.type, name: meta.name };
}

export class ResourceRepository {
  private dbFactory: (real: Kysely<Database>) => Kysely<Database>;
  private resourceInputSchema: typeof createResourceInputSchema;

  constructor({ mockDb, mockResourceInputSchema }: ResourceRepositoryOptions = {}) {
    this.dbFactory = mockDb ? () => mockDb : (db) => db;
    this.resourceInputSchema = mockResourceInputSchema ?? createResourceInputSchema;
  }

  async create(data: ResourceInput<any>, userId: string) {
    return repositorySafe(async () => {
      const parsed = this.resourceInputSchema(data.type).parse(data);
      const id = formatResourceId(parsed);
      const now = new Date();
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        const created = await conn
          .insertInto('resources')
          .values({
            ...parsed,
            id,
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        const refs = extractResourceRefs(parsed.data);
        if (refs.length) {
          await conn
            .insertInto('resource_edges')
            .values(
              refs.map((ref) => ({
                from: id,
                to: ref,
                type: 'reference',
              }))
            )
            .execute();
        }
        return created;
      });
    });
  }

  async update(path: ResourcePath, data: object) {
    return repositorySafe(async () => {
      const parsed = this.resourceInputSchema(path.type).parse(data);
      if (parsed.namespace !== path.namespace) throw new Error('cannot change namespace');
      if (parsed.type !== path.type) throw new Error('cannot change type');
      const oldId = formatResourceId(path);
      const id = formatResourceId(parsed);
      const now = new Date();
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        const updated = await conn
          .updateTable('resources')
          .set({
            ...parsed,
            id,
            updatedAt: now,
          })
          .where('id', '=', oldId)
          .returningAll()
          .executeTakeFirstOrThrow();
        await conn.deleteFrom('resource_edges').where('from', '=', oldId).execute();
        const refs = extractResourceRefs(parsed.data);
        if (refs.length) {
          await conn
            .insertInto('resource_edges')
            .values(
              refs.map((ref) => ({
                from: id,
                to: ref,
                type: 'reference',
              }))
            )
            .execute();
        }
        return updated;
      });
    });
  }

  async getCreatedBy(path: ResourcePath) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const resource = await conn
          .selectFrom('resources')
          .select('createdBy')
          .where('id', '=', formatResourceId(path))
          .executeTakeFirstOrThrow();
        return resource.createdBy;
      });
    });
  }

  async get(path: ResourcePath) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const resource = await conn
          .selectFrom('resources')
          .selectAll()
          .where('id', '=', formatResourceId(path))
          .executeTakeFirstOrThrow();
        return resource;
      });
    });
  }

  async find(query: any, userId: string, sortKey: string, limit?: number, options?: FindOptions) {
    return repositorySafe(async () => {
      const parsed = ResourceFilterSchema.parse(query);
      const dbFetchLimit = resolveDbFetchLimit(limit, options);
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const rows = applyResourceFilter(conn.selectFrom('resources').selectAll(), parsed)
          .where((eb) =>
            eb.exists(
              conn
                .selectFrom('namespace_permissions')
                .select('userId')
                .whereRef('namespace_permissions.namespaceId', '=', eb.ref('resources.namespace'))
                .where('userId', '=', userId)
            )
          )
          .orderBy(sortKey)
          .limit(dbFetchLimit)
          .execute();
        return rows;
      });
    });
  }

  async findIncomingReferences(path: ResourcePath) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        return conn.selectFrom('resource_edges').selectAll().where('to', '=', formatResourceId(path)).execute();
      });
    });
  }

  async delete(path: ResourcePath) {
    return repositorySafe(async () => {
      const id = formatResourceId(path);
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        await conn.deleteFrom('resources').where('id', '=', id).returningAll().executeTakeFirstOrThrow();
        await conn
          .deleteFrom('resource_edges')
          .where((eb) => eb.or([eb('from', '=', id), eb('to', '=', id)]))
          .returningAll()
          .executeTakeFirst();
      });
    });
  }
}
