import { Client } from 'pg';
import crypto from 'node:crypto';
import { runner } from 'node-pg-migrate';

let schemaName: string;
let client: Client;

function createSchemaName() {
  const id = crypto.randomBytes(6).toString('hex');
  return `test_${id}`;
}

beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL!;
  client = new Client({ connectionString });
  await client.connect();
  schemaName = createSchemaName();
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  await client.query(`SET search_path TO ${schemaName}`);
  process.env.DATABASE_SCHEMA = schemaName;
  await runMigrations(connectionString, schemaName);
});

afterAll(async () => {
  if (!client) return;

  delete process.env.DATABASE_SCHEMA;
  await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
  await client.end();
});

async function runMigrations(connectionString: string, schema: string) {
  await runner({
    databaseUrl: connectionString,
    dir: 'migrations',
    direction: 'up',
    migrationsTable: 'pgmigrations',
    schema,
  });
}
