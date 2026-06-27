import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.createExtension('pg_trgm', {
    ifNotExists: true,
  });
}

export function down(pgm: MigrationBuilder) {
  pgm.dropExtension('pg_trgm');
}
