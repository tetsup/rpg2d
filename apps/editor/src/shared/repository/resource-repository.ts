import { createRepository } from './factory';

export const resourceRepository = createRepository<'resources'>({
  key: 'resources',
  basePath: '/api/resources',
});
