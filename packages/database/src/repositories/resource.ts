import { Kysely } from 'kysely';
import { ResourcePath, ResourceType } from '@sharedTypes/resource/common';
import { Database, ResourceDocument, ResourceInput } from '@sharedTypes/database/collection';
import { createResourceInputSchema } from '@schema/database/resource';
import { ResourceFilterSchema } from '@schema/filter/domain';
import { formatResourceId } from '@schema/resource/common/base';
import { extractResourceRefs } from '@database/utils/resource';
import { execute, withTransaction } from '@database/client/pg-client';
import { contains } from '@database/filters/utils';
import { applyResourceFilter } from '@database/filters/resource';
import { repositorySafe } from './utils/common';
import { FindOptions, resolveDbFetchLimit } from './utils/limits';

type FindParams = {
  name?: string;
  type?: ResourceType;
  namespace?: string;
  cursor?: string;
  limit?: number;
};

type ResourceRepositoryOptions = {
  mockDb?: Kysely<Database>;
  mockResourceInputSchema?: typeof createResourceInputSchema;
};

export function getPath(meta: Pick<ResourceDocument, 'namespace' | 'type' | 'name'>) {
  return { namespace: meta.namespace, type: meta.type, name: meta.name };
}

function toDocument(path: ResourcePath, input: ResourceInput<any>): ResourceDocument {
  return { ...input, id: formatResourceId(path) };
}

export class ResourceRepository {
  private dbFactory: (real: Kysely<Database>) => Kysely<Database>;
  private resourceInputSchema: typeof createResourceInputSchema;

  constructor({ mockDb, mockResourceInputSchema }: ResourceRepositoryOptions = {}) {
    this.dbFactory = mockDb ? () => mockDb : (db) => db;
    this.resourceInputSchema = mockResourceInputSchema ?? createResourceInputSchema;
  }

  async create(path: ResourcePath, data: object, userId: string) {
    return repositorySafe(async () => {
      const input = this.resourceInputSchema(path.type).parse({
        ...(data as object),
        namespace: path.namespace,
        type: path.type,
        name: path.name,
      });
      const document = toDocument(path, input);
      const now = new Date();
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        const created = await conn
          .insertInto('resources')
          .values({
            ...document,
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        const refs = extractResourceRefs(input.data);
        if (refs.length) {
          await conn
            .insertInto('resource_edges')
            .values(
              refs.map((ref) => ({
                from: document.id,
                to: ref,
                type: 'reference',
              }))
            )
            .execute();
          return created;
        }
      });
    });
  }

  async update(path: ResourcePath, data: object) {
    return repositorySafe(async () => {
      const input = this.resourceInputSchema(path.type).parse(data);
      if (input.namespace !== path.namespace) throw new Error('cannot change namespace');
      if (input.type !== path.type) throw new Error('cannot change type');
      const document = toDocument(path, input);
      const now = new Date();
      const newPath = getPath(document);
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        const updated = await conn
          .updateTable('resources')
          .set({
            name: document.name,
            isDraft: document.isDraft,
            data: input.data,
            updatedAt: now,
          })
          .where('id', '=', formatResourceId(path))
          .returningAll()
          .executeTakeFirst();
        await conn.deleteFrom('resource_edges').where('from', '=', formatResourceId(path)).execute();
        const refs = extractResourceRefs(input.data);
        if (refs.length) {
          await conn
            .insertInto('resource_edges')
            .values(
              refs.map((ref) => ({
                from: formatResourceId(newPath),
                to: ref,
                type: 'reference',
              }))
            )
            .execute();
          return updated;
        }
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
        return conn.selectFrom('resource_edges').selectAll().where('to', '=', formatResourceId(path)).execute();
      });
    });
  }

  async delete(path: ResourcePath) {
    return repositorySafe(async () => {
      return withTransaction(async (db) => {
        const conn = this.dbFactory(db);
        const id = formatResourceId(path);
        await conn.deleteFrom('resources').where('id', '=', id).executeTakeFirstOrThrow();
        await conn
          .deleteFrom('resource_edges')
          .where((eb) => eb.or([eb('from', '=', id), eb('to', '=', id)]))
          .execute();
      });
    });
  }
}
