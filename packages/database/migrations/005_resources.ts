import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.createTable('resources', {
    id: { type: 'text', primaryKey: true },
    namespace: { type: 'text', notNull: true, references: 'namespaces' },
    type: { type: 'text', notNull: true },
    name: { type: 'text', notNull: true },
    version: { type: 'integer', notNull: true },
    description: { type: 'text' },
    isValid: { type: 'boolean', notNull: true, default: false },
    data: { type: 'jsonb', notNull: true },
    createdAt: { type: 'timestamp', notNull: true },
    updatedAt: { type: 'timestamp', notNull: true },
  });

  pgm.createIndex('resources', 'namespace');
  pgm.createIndex('resources', 'type');
  pgm.createIndex('resources', 'name');
  pgm.createIndex(
    'resources',
    [{ name: 'description', opclass: { schema: 'public', name: 'gin_trgm_ops' } }],
    {
      method: 'gin',
    }
  );
  pgm.createIndex('resources', 'data', {
    method: 'gin',
  });
}

export function down(pgm: MigrationBuilder) {
  pgm.dropTable('resources');
}
