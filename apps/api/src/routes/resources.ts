import { Hono } from 'hono';
import { handle } from '../utils/handle';
import { ResourceRepository } from '@database/repositories/resource';
import { findWithCursor } from '@database/repositories/utils/filter';
import { resolveUserMiddleware } from '@api/auth/middlewares/resolve-user';

const resourcesRoute = new Hono();
resourcesRoute.use('*', resolveUserMiddleware);

resourcesRoute.post(
  '/search',
  handle(async (c) => {
    const { query, cursor } = await c.req.json();
    const userId = c.get('user').id;
    return await findWithCursor({
      repository: new ResourceRepository(),
      query,
      userId,
      cursor,
      sortKey: 'id',
      chunkSize: 50,
    });
  })
);

export { resourcesRoute };
