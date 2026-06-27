import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from '@sharedTypes/database/collection';
import { getDatabaseSchema, getPoolOptions } from './schema-config';

let db: Kysely<Database> | null = null;
let activeSchema: string | undefined;

export async function resetDb() {
  if (!db) {
    activeSchema = undefined;
    return;
  }

  await db.destroy();
  db = null;
  activeSchema = undefined;
}

export function getDb() {
  const schema = getDatabaseSchema();

  if (db) {
    if (activeSchema !== schema) {
      throw new Error('DATABASE_SCHEMA changed without calling resetDb()');
    }
    return db;
  }

  activeSchema = schema;
  db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        ...getPoolOptions(),
      }),
    }),
  });
  return db;
}

export async function execute<T>(fn: (db: Kysely<Database>) => Promise<T>) {
  return fn(getDb());
}

export async function withTransaction<T>(fn: (trx: Kysely<Database>) => Promise<T>) {
  return getDb().transaction().execute(fn);
}
