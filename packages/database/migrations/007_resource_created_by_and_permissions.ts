import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.sql(`UPDATE namespace_permissions SET permission = 'editor' WHERE permission = 'maintainer'`);

  pgm.addColumn('resources', {
    createdBy: { type: 'text', notNull: false, references: 'users', onDelete: 'RESTRICT' },
  });

  pgm.sql(`
    UPDATE resources r
    SET "createdBy" = n."createdBy"
    FROM namespaces n
    WHERE r.namespace = n.id AND r."createdBy" IS NULL
  `);

  pgm.alterColumn('resources', 'createdBy', { notNull: true });
  pgm.createIndex('resources', 'createdBy');
}

export function down(pgm: MigrationBuilder) {
  pgm.dropIndex('resources', 'createdBy');
  pgm.dropColumn('resources', 'createdBy');
  pgm.sql(`UPDATE namespace_permissions SET permission = 'maintainer' WHERE permission = 'editor'`);
}
