import { sql } from 'kysely';
import { expect } from 'vitest';
import { getDatabaseSchema } from '@database/client/schema-config';
import { execute } from '@database/client/pg-client';
import { describe, it } from './integration-test';
import { getTestWorkerSchemaName } from './worker-schema';

describe('worker schema setup (L2)', () => {
  it('sets DATABASE_SCHEMA to the worker-specific schema name', () => {
    expect(getDatabaseSchema()).toBe(getTestWorkerSchemaName());
    expect(getDatabaseSchema()).toMatch(/^test_w\d+$/);
  });

  it('migrates tables into the worker schema', async () => {
    const schemaName = getTestWorkerSchemaName();

    await execute(async (db) => {
      const result = await sql<{ table_schema: string }>`
        SELECT table_schema
        FROM information_schema.tables
        WHERE table_name = 'users'
          AND table_schema = ${schemaName}
      `.execute(db);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.table_schema).toBe(schemaName);
    });
  });

  it('records migrations in the worker schema', async () => {
    const schemaName = getTestWorkerSchemaName();

    await execute(async (db) => {
      const result = await sql<{ table_schema: string }>`
        SELECT table_schema
        FROM information_schema.tables
        WHERE table_name = 'pgmigrations'
          AND table_schema = ${schemaName}
      `.execute(db);

      expect(result.rows).toHaveLength(1);
    });
  });
});
