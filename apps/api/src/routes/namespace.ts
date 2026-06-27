import { Hono } from 'hono';
import { handle } from '../utils/handle';
import { NamespaceRepository } from '@database/repositories/namespace';
import { findWithCursor } from '@database/repositories/utils/filter';
import { resolveUserMiddleware } from '@api/auth/middlewares/resolve-user';

const namespaceRoute = new Hono();
namespaceRoute.use('*', resolveUserMiddleware);

namespaceRoute.get(
  '/:id',
  handle(async (c) => {
    const id = c.req.param('id')!;
    return await new NamespaceRepository().get(id);
  })
);

namespaceRoute.post(
  '/',
  handle(async (c) => {
    const userId = c.get('user').id;
    return await new NamespaceRepository().create(await c.req.json(), userId);
  })
);

namespaceRoute.put(
  '/:id',
  handle(async (c) => {
    const id = c.req.param('id')!;
    return await new NamespaceRepository().update(id, await c.req.json());
  })
);

namespaceRoute.delete(
  '/:id',
  handle(async (c) => {
    const id = c.req.param('id')!;
    return await new NamespaceRepository().delete(id);
  })
);

namespaceRoute.post(
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

export { namespaceRoute };
