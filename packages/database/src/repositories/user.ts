import type { Kysely } from 'kysely';
import type { Database } from '@sharedTypes/database/collection';
import { execute } from '@database/client/pg-client';
import { UserDocumentSchema } from '@schema/database/user';
import { RepositoryNotFoundError, repositorySafe } from './utils/common';
import { FindOptions, resolveDbFetchLimit } from './utils/limits';
import { UserFilterSchema } from '@schema/filter/domain';
import { applyUserFilter } from '@database/filters/user';

type UserRepositoryOptions = {
  mockDb?: Kysely<Database>;
  mockSchema?: typeof UserDocumentSchema;
};

export class UserRepository {
  private dbFactory: (real: Kysely<Database>) => Kysely<Database>;
  private schema: typeof UserDocumentSchema;

  constructor({ mockDb, mockSchema }: UserRepositoryOptions = {}) {
    this.dbFactory = mockDb ? () => mockDb : (db) => db;
    this.schema = mockSchema ?? UserDocumentSchema;
  }

  async get(id: string) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const user = await conn.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst();
        if (!user) throw new RepositoryNotFoundError();

        return user;
      });
    });
  }

  async update(data: any, upsert = false) {
    return repositorySafe(async () => {
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        const now = new Date();
        const user = this.schema.parse(data);
        if (upsert) {
          await conn
            .insertInto('users')
            .values({ ...user, createdAt: now, updatedAt: now })
            .onConflict((oc) => oc.column('id').doUpdateSet({ ...user, updatedAt: now }))
            .execute();
        } else {
          await conn
            .updateTable('users')
            .set({ ...user, updatedAt: now })
            .where('id', '=', user.id)
            .execute();
        }
      });
    });
  }

  async upsert(data: any) {
    return this.update(data, true);
  }

  async find(query: any, _: string, sortKey: string, limit?: number, options?: FindOptions) {
    return repositorySafe(async () => {
      const parsed = UserFilterSchema.parse(query);
      const dbFetchLimit = resolveDbFetchLimit(limit, options);
      return execute(async (db) => {
        const conn = this.dbFactory(db);
        return await applyUserFilter(conn.selectFrom('users').selectAll(), parsed)
          .orderBy(sortKey)
          .limit(dbFetchLimit)
          .execute();
      });
    });
  }
}
