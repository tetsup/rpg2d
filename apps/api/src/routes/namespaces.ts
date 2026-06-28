import { Hono } from 'hono';
import { handle } from '../utils/handle';
import { NamespaceRepository } from '@database/repositories/namespace';
import { findWithCursor } from '@database/repositories/utils/filter';
import { resolveUserMiddleware } from '@api/auth/middlewares/resolve-user';

const namespacesRoute = new Hono();
namespacesRoute.use('*', resolveUserMiddleware);

namespacesRoute.post(
  '/search',
  handle(async (c) => {
    const { query, cursor } = await c.req.json();
    const userId = c.get('user').id;
    return await findWithCursor({
      repository: new NamespaceRepository(),
      query,
      userId,
      cursor,
      sortKey: 'id',
      chunkSize: 50,
    });
  })
);

namespacesRoute.get(
  '/:id',
  handle(async (c) => {
    const id = c.req.param('id')!;
    return await new NamespaceRepository().get(id);
  })
);

namespacesRoute.post(
  '/',
  handle(async (c) => {
    const userId = c.get('user').id;
    return await new NamespaceRepository().create(await c.req.json(), userId);
  })
);

namespacesRoute.put(
  '/:id',
  handle(async (c) => {
    const id = c.req.param('id')!;
    return await new NamespaceRepository().update(id, await c.req.json());
  })
);

namespacesRoute.delete(
  '/:id',
  handle(async (c) => {
    const id = c.req.param('id')!;
    return await new NamespaceRepository().delete(id);
  })
);

export { namespacesRoute };
