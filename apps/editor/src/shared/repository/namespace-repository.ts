import { createRepository } from './factory';

export const namespaceRepository = createRepository<'namespaces'>({
  key: 'namespaces',
  basePath: '/api/namespaces',
});
