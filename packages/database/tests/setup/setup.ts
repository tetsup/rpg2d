import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { register } from 'tsx/esm/api';
import { Client } from 'pg';
import crypto from 'node:crypto';
import { runner } from 'node-pg-migrate';

const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../migrations');

let schemaName: string;
let client: Client;
let tsxRegistered = false;

function createSchemaName() {
  const id = crypto.randomBytes(6).toString('hex');
  return `test_${id}`;
}

function ensureTsxRegistered() {
  if (tsxRegistered) {
    return;
  }

  register({
    tsconfig: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../tsconfig.json'),
  });
  tsxRegistered = true;
}

beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL!;
  client = new Client({ connectionString });
  await client.connect();
  schemaName = createSchemaName();
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA public');
  process.env.DATABASE_SCHEMA = schemaName;
  await runMigrations(connectionString, schemaName);
});

afterAll(async () => {
  if (!client) return;

  delete process.env.DATABASE_SCHEMA;
  await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  await client.end();
});

async function runMigrations(connectionString: string, schema: string) {
  ensureTsxRegistered();

  await runner({
    databaseUrl: connectionString,
    dir: migrationsDir,
    direction: 'up',
    migrationsTable: 'pgmigrations',
    schema: [schema, 'public'],
  });
}
