import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from '@sharedTypes/database/collection';
import { getPoolOptions } from './schema-config';

let db: Kysely<Database> | null = null;

export function getDb() {
  if (db) return db;
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
