import { Migration } from '../types';

export const migration001: Migration = {
  version: 1,
  name: 'resource-id-unique-index',
  type: 'index',
  transactional: false,

  async up(tx) {
    await tx.db.collection('resources').createIndex({ id: 1 }, { unique: true, name: 'resource_id_unique' });
  },

  async verify(tx) {
    const indexes = await tx.db.collection('resources').indexes();
    const exists = indexes.some((v) => v.name === 'resource_id_unique' && v.unique === true && v.key.id === 1);
    if (!exists) throw new Error('resource_id_unique missing');
  },
};
