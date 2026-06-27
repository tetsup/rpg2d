import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.createTable('resource_edges', {
    from: {
      type: 'text',
      notNull: true,
      references: 'resources',
      referencesConstraintName: 'resource_edges_from_fk',
      onDelete: 'CASCADE',
    },
    to: {
      type: 'text',
      notNull: true,
      references: 'resources',
      referencesConstraintName: 'resource_edges_to_fk',
      onDelete: 'CASCADE',
    },
    type: { type: 'text', notNull: true },
  });

  pgm.createIndex('resource_edges', 'from');
  pgm.createIndex('resource_edges', 'to');
}

export function down(pgm: MigrationBuilder) {
  pgm.dropTable('resource_edges');
}
