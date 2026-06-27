import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.createTable('namespace_permissions', {
    namespaceId: { type: 'text', notNull: true, references: 'namespaces', onDelete: 'CASCADE' },
    userId: { type: 'text', notNull: true, references: 'users', onDelete: 'CASCADE' },
    permission: { type: 'text', notNull: true },
    createdAt: { type: 'timestamp', notNull: true },
    updatedAt: { type: 'timestamp', notNull: true },
  });

  pgm.addConstraint(
    'namespace_permissions',
    'namespace_permissions_pk',
    'PRIMARY KEY("namespaceId","userId","permission")'
  );
  pgm.createIndex('namespace_permissions', 'namespaceId');
  pgm.createIndex('namespace_permissions', 'userId');
}

export function down(pgm: MigrationBuilder) {
  pgm.dropTable('namespace_permissions');
}
