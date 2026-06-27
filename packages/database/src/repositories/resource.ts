import { Kysely } from 'kysely';
import { ResourcePath } from '@sharedTypes/resource/common';
import { Database, ResourceMeta } from '@sharedTypes/database/collection';
import { createResourceDocumentSchema } from '@schema/database/resource';
import { ResourceFilterSchema } from '@schema/filter/domain';
import { buildId, extractResourceRefs } from '@database/utils/resource';
import { execute, withTransaction } from '@database/client/pg-client';
import { contains } from '@database/filters/utils';
import { applyResourceFilter } from '@database/filters/resource';
import { RepositoryNotFoundError, repositorySafe } from './utils/common';
import { FindOptions, resolveDbFetchLimit } from './utils/limits';

type FindParams = {
  name?: string;
  type?: string;
  namespace?: string;
  cursor?: string;
  limit?: number;
};

type ResourceRepositoryOptions = {
  mockDb?: Kysely<Database>;
  mockResourceDocumentSchema?: typeof createResourceDocumentSchema;
};

function getPath(meta: ResourceMeta<any>) {
  return { namespace: meta.namespace, type: meta.type, name: meta.name };
}

export class ResourceRepository {
  private dbFactory: (real: Kysely<Database>) => Kysely<Database>;
  private resourceDocumentSchema: typeof createResourceDocumentSchema;

  constructor({ mockDb, mockResourceDocumentSchema }: ResourceRepositoryOptions = {}) {
    this.dbFactory = mockDb ? () => mockDb : (db) => db;
    this.resourceDocumentSchema = mockResourceDocumentSchema ?? createResourceDocumentSchema;
  }

  async create(path: ResourcePath, data: object) {
    return repositorySafe(async () => {
      const parsed = this.resourceDocumentSchema(path.type).parse(data);
      if (parsed.namespace !== path.namespace) throw new Error('namespace does not match');
      if (parsed.type !== path.type) throw new Error('type does not match');
      if (parsed.name !== path.name) throw new Error('name does not match');
      const now = new Date();
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        await conn
          .insertInto('resources')
          .values({
            ...parsed,
            createdAt: now,
            updatedAt: now,
          })
          .execute();
        const refs = extractResourceRefs(data);
        if (refs.length) {
          await conn
            .insertInto('resource_edges')
            .values(
              refs.map((ref) => ({
                from: buildId(path),
                to: ref,
                type: 'reference',
              }))
            )
            .execute();
        }
      });
    });
  }

  async update(path: ResourcePath, data: object) {
    return repositorySafe(async () => {
      const parsed = this.resourceDocumentSchema(path.type).parse(data);
      if (parsed.namespace !== path.namespace) throw new Error('cannot change namespace');
      if (parsed.type !== path.type) throw new Error('cannot change type');
      const now = new Date();
      const newPath = getPath(parsed);
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        const result = await conn
          .updateTable('resources')
          .set({
            name: parsed.name,
            isValid: parsed.isValid,
            data: parsed,
            updatedAt: now,
          })
          .where('id', '=', buildId(path))
          .executeTakeFirst();
        if (Number(result.numUpdatedRows) === 0) throw new RepositoryNotFoundError();
        await conn.deleteFrom('resource_edges').where('from', '=', buildId(path)).execute();
        const refs = extractResourceRefs(data);
        if (refs.length) {
          await conn
            .insertInto('resource_edges')
            .values(
              refs.map((ref) => ({
                from: buildId(newPath),
                to: ref,
                type: 'reference',
              }))
            )
            .execute();
        }
      });
    });
  }

  async get(path: ResourcePath) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const resource = await conn
          .selectFrom('resources')
          .select('data')
          .where('id', '=', buildId(path))
          .executeTakeFirst();
        if (!resource) throw new RepositoryNotFoundError();

        return resource.data;
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

  async findOld({ name, type, namespace, cursor, limit = 40 }: FindParams) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        let qb = conn.selectFrom('resources').selectAll().orderBy('id');
        if (type) qb = qb.where('type', '=', type);
        if (namespace) qb = qb.where('namespace', '=', namespace);
        if (cursor) qb = qb.where('id', '>', cursor);
        if (name) qb = qb.where('name', 'ilike', contains(name));
        const rows = await qb.limit(limit + 1).execute();
        const hasMore = rows.length > limit;
        const items = rows.slice(0, limit);
        return {
          items,
          hasMore,
          nextCursor: hasMore ? items.at(-1)?.id : undefined,
        };
      });
    });
  }

  async findIncomingReferences(path: ResourcePath) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        return conn.selectFrom('resource_edges').selectAll().where('to', '=', buildId(path)).execute();
      });
    });
  }

  async delete(path: ResourcePath) {
    return repositorySafe(async () => {
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        const id = buildId(path);
        const result = await conn.deleteFrom('resources').where('id', '=', id).executeTakeFirst();
        if (Number(result.numDeletedRows) === 0) throw new RepositoryNotFoundError();

        await conn
          .deleteFrom('resource_edges')
          .where((eb) => eb.or([eb('from', '=', id), eb('to', '=', id)]))
          .execute();
      });
    });
  }
}
