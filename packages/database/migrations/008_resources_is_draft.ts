import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.renameColumn('resources', 'isValid', 'isDraft');
  pgm.sql('UPDATE resources SET "isDraft" = NOT "isDraft"');
  pgm.alterColumn('resources', 'isDraft', { default: true });
}

export function down(pgm: MigrationBuilder) {
  pgm.sql('UPDATE resources SET "isDraft" = NOT "isDraft"');
  pgm.alterColumn('resources', 'isDraft', { default: false });
  pgm.renameColumn('resources', 'isDraft', 'isValid');
}
