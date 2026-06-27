import { MigrationBuilder } from 'node-pg-migrate';

export function up(pgm: MigrationBuilder) {
  pgm.createTable('users', {
    id: { type: 'text', primaryKey: true },
    presenceName: { type: 'text', notNull: true },
    email: { type: 'text' },
    avatar: { type: 'text' },
    isAdmin: { type: 'boolean', notNull: true, default: false },
    createdAt: { type: 'timestamp', notNull: true },
    updatedAt: { type: 'timestamp', notNull: true },
  });
  pgm.createIndex('users', 'presenceName');
  pgm.createIndex('users', 'email');
}

export function down(pgm: MigrationBuilder) {
  pgm.dropTable('users');
}
