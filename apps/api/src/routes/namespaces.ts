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

export { namespacesRoute };
