import { Hono } from 'hono';
import { handle } from '../utils/handle';
import { NamespaceRepository } from '@database/repositories/namespace';
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
    const params = await c.req.json();
    const userId = c.get('user').id;
    return await new NamespaceRepository().findWithCursor(params.query, userId, params.cursor);
  })
);

export { namespaceRoute };
