import { sql } from 'kysely';
import { execute } from '@database/client/pg-client';

export async function clearTables() {
  await execute(async (db) => {
    await sql`TRUNCATE TABLE resource_edges, resources, namespace_permissions, namespaces, users RESTART IDENTITY CASCADE`.execute(
      db
    );
  });
}

export async function countRows(table: 'users' | 'namespaces' | 'namespace_permissions' | 'resources' | 'resource_edges') {
  return execute(async (db) => {
    const result = await db
      .selectFrom(table)
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow();
    return Number(result.count);
  });
}
