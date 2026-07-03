import { Hono } from 'hono';
import { ResourceRepository } from '@database/repositories/resource';
import { findWithCursor } from '@database/repositories/utils/filter';
import { ResourcePathSchema } from '@schema/resource/common/base';
import { authorizeResourceMiddleware } from '@api/auth/middlewares/authorize-resource';
import { resolveUserMiddleware } from '@api/auth/middlewares/resolve-user';
import { Action } from '../utils/authorize';
import { handle } from '../utils/handle';
import { parseParams } from '../utils/params';

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

resourcesRoute.get(
  '/:namespace/:type/:name',
  authorizeResourceMiddleware(Action.READ),
  handle(async (c) => {
    const pathParams = parseParams(ResourcePathSchema, c.req.param());
    return await new ResourceRepository().get(pathParams);
  })
);

resourcesRoute.post(
  '/:namespace/:type/:name',
  authorizeResourceMiddleware(Action.CREATE),
  handle(async (c) => {
    const pathParams = parseParams(ResourcePathSchema, c.req.param());
    return await new ResourceRepository().create(pathParams, await c.req.json(), c.get('user').id);
  })
);

resourcesRoute.put(
  '/:namespace/:type/:name',
  authorizeResourceMiddleware(Action.UPDATE),
  handle(async (c) => {
    const pathParams = parseParams(ResourcePathSchema, c.req.param());
    return await new ResourceRepository().update(pathParams, await c.req.json());
  })
);

resourcesRoute.delete(
  '/:namespace/:type/:name',
  authorizeResourceMiddleware(Action.DELETE),
  handle(async (c) => {
    const pathParams = parseParams(ResourcePathSchema, c.req.param());
    return await new ResourceRepository().delete(pathParams);
  })
);

export { resourcesRoute };
