import { Hono } from 'hono';
import { ResourceRepository } from '@database/repositories/resource';
import { findWithCursor } from '@database/repositories/utils/filter';
import { ResourceByIdReqSchema } from '@schema/api/resource/by-id';
import { resolveUserMiddleware } from '@api/auth/middlewares/resolve-user';
import { UnauthorizedError } from '@api/errors/http-error';
import { Action } from '../utils/authorize';
import { handle } from '../utils/handle';
import { parseParams } from '../utils/params';
import { ensureResourceAccess } from '../utils/resource-access';

const resourcesRoute = new Hono();
resourcesRoute.use('*', resolveUserMiddleware);

resourcesRoute.post(
  '/search',
  handle(async (c) => {
    const user = c.get('user');
    if (user == null) throw new UnauthorizedError();

    const { query, cursor } = await c.req.json();
    return await findWithCursor({
      repository: new ResourceRepository(),
      query,
      userId: user.id,
      cursor,
      sortKey: 'id',
      chunkSize: 50,
    });
  })
);

resourcesRoute.get(
  '/:namespace/:type/:name',
  handle(async (c) => {
    const pathParams = parseParams(ResourceByIdReqSchema, c.req.param());
    await ensureResourceAccess(c.get('user'), pathParams, Action.READ);
    return await new ResourceRepository().get(pathParams);
  })
);

resourcesRoute.post(
  '/:namespace/:type/:name',
  handle(async (c) => {
    const user = c.get('user');
    if (user == null) throw new UnauthorizedError();

    const pathParams = parseParams(ResourceByIdReqSchema, c.req.param());
    await ensureResourceAccess(user, pathParams, Action.CREATE);
    return await new ResourceRepository().create(pathParams, await c.req.json(), user.id);
  })
);

resourcesRoute.put(
  '/:namespace/:type/:name',
  handle(async (c) => {
    const pathParams = parseParams(ResourceByIdReqSchema, c.req.param());
    await ensureResourceAccess(c.get('user'), pathParams, Action.UPDATE);
    return await new ResourceRepository().update(pathParams, await c.req.json());
  })
);

resourcesRoute.delete(
  '/:namespace/:type/:name',
  handle(async (c) => {
    const pathParams = parseParams(ResourceByIdReqSchema, c.req.param());
    await ensureResourceAccess(c.get('user'), pathParams, Action.DELETE);
    return await new ResourceRepository().delete(pathParams);
  })
);

export { resourcesRoute };
