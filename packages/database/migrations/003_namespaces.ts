import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.createTable('namespaces', {
    id: { type: 'text', primaryKey: true },
    presenceName: { type: 'text', notNull: true },
    description: { type: 'text' },
    isPrivate: { type: 'boolean', notNull: true },
    createdBy: { type: 'text', notNull: true, references: 'users', onDelete: 'RESTRICT' },
    createdAt: { type: 'timestamp', notNull: true },
    updatedAt: { type: 'timestamp', notNull: true },
  });

  pgm.createIndex('namespaces', 'createdBy');
  pgm.createIndex('namespaces', 'isPrivate');
  pgm.createIndex('namespaces', [{ name: 'description', opclass: 'gin_trgm_ops' }], { method: 'gin' });
}

export function down(pgm: MigrationBuilder) {
  pgm.dropTable('namespaces');
}
