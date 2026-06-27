import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'tsx/esm/api';
import { Client } from 'pg';
import { runner } from 'node-pg-migrate';
import { resetDb } from '@database/client/pg-client';

const TEST_SCHEMA_PATTERN = /^test_w\d+$/;
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const migrationsDir = path.resolve(packageRoot, 'migrations');

let tsxRegistered = false;

function ensureTsxRegistered() {
  if (tsxRegistered) {
    return;
  }

  register({
    tsconfig: path.join(packageRoot, 'tsconfig.json'),
  });
  tsxRegistered = true;
}

export function getTestWorkerSchemaName(): string {
  const workerId = process.env.VITEST_WORKER_ID;
  if (!workerId) {
    throw new Error('VITEST_WORKER_ID is not set');
  }

  const schemaName = `test_w${workerId}`;
  if (!TEST_SCHEMA_PATTERN.test(schemaName)) {
    throw new Error(`Invalid test schema name: ${schemaName}`);
  }

  return schemaName;
}

function quoteIdent(schemaName: string): string {
  if (!TEST_SCHEMA_PATTERN.test(schemaName)) {
    throw new Error(`Refusing to operate on non-test schema: ${schemaName}`);
  }

  return `"${schemaName}"`;
}

const PG_TRGM_SETUP_LOCK_ID = 0x52504732; // 'RPG2'

async function ensurePgTrgmInPublic(client: Client) {
  await client.query(`SELECT pg_advisory_lock(${PG_TRGM_SETUP_LOCK_ID})`);

  try {
    const result = await client.query<{ extschema: string }>(`
      SELECT n.nspname AS extschema
      FROM pg_extension e
      JOIN pg_namespace n ON n.oid = e.extnamespace
      WHERE e.extname = 'pg_trgm'
    `);

    const currentSchema = result.rows[0]?.extschema;
    if (currentSchema === 'public') {
      return;
    }

    if (currentSchema) {
      await client.query('DROP EXTENSION IF EXISTS pg_trgm CASCADE');
    }

    await client.query('CREATE EXTENSION pg_trgm SCHEMA public');
  } finally {
    await client.query(`SELECT pg_advisory_unlock(${PG_TRGM_SETUP_LOCK_ID})`);
  }
}

async function runMigrations(connectionString: string, schema: string) {
  ensureTsxRegistered();

  await runner({
    databaseUrl: connectionString,
    dir: migrationsDir,
    direction: 'up',
    migrationsTable: 'pgmigrations',
    schema: [schema, 'public'],
    noLock: true,
  });
}

export async function prepareWorkerSchema(): Promise<string> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const schemaName = getTestWorkerSchemaName();
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(`DROP SCHEMA IF EXISTS ${quoteIdent(schemaName)} CASCADE`);
    await client.query(`CREATE SCHEMA ${quoteIdent(schemaName)}`);
    await ensurePgTrgmInPublic(client);
  } finally {
    await client.end();
  }

  process.env.DATABASE_SCHEMA = schemaName;
  await resetDb();
  await runMigrations(connectionString, schemaName);

  return schemaName;
}

export async function teardownWorkerSchema(schemaName: string): Promise<void> {
  await resetDb();
  delete process.env.DATABASE_SCHEMA;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(`DROP SCHEMA IF EXISTS ${quoteIdent(schemaName)} CASCADE`);
  } finally {
    await client.end();
  }
}
