import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.sql(`
    DO $$
    DECLARE
      primary_schema text;
    BEGIN
      primary_schema := split_part(replace(current_setting('search_path'), '"', ''), ',', 1);

      IF primary_schema LIKE 'test\\_%' THEN
        IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
          RAISE EXCEPTION $msg$
pg_trgm extension is not enabled in this database.

Database integration tests require pg_trgm to be installed once in the target database before running tests. Tests do not create the extension to avoid parallel migration races.

Fix:
  1. Ensure PostgreSQL is running and DATABASE_URL is set
  2. Run migrations against the default (public) schema:
       pnpm db:migrate
$msg$;
        END IF;
      ELSE
        CREATE EXTENSION IF NOT EXISTS pg_trgm;
      END IF;
    END $$;
  `);
}

export function down(pgm: MigrationBuilder) {
  pgm.sql(`
    DO $$
    DECLARE
      primary_schema text;
    BEGIN
      primary_schema := split_part(replace(current_setting('search_path'), '"', ''), ',', 1);

      IF primary_schema NOT LIKE 'test\\_%' THEN
        DROP EXTENSION IF EXISTS pg_trgm;
      END IF;
    END $$;
  `);
}
