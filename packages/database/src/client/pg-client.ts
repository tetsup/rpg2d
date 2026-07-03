import { Pool as NeonPool } from '@neondatabase/serverless';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool as PgPool } from 'pg';
import type { Database } from '@sharedTypes/database/collection';
import { getPoolOptions } from './schema-config';

let db: Kysely<Database> | null = null;

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const driver = process.env.DATABASE_DRIVER ?? 'pg';

  if (driver === 'neon') {
    return new NeonPool({
      connectionString,
      max: 1,
    });
  }

  if (driver !== 'pg') {
    throw new Error(`Unsupported DATABASE_DRIVER: ${driver}. Expected "pg" or "neon".`);
  }

  return new PgPool({
    connectionString,
    max: 10,
    ...getPoolOptions(),
  });
}

export function getDb() {
  if (db) return db;
  db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: createPool(),
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
