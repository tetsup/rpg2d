import { Hono } from 'hono';
import { ResourceRepository } from '@database/repositories/resource';
import { ResourceSearchReqParamsSchema } from '@api/schemas/resources/search-params';
import { ResourceByIdReqSchema } from '@api/schemas/resources/by-id';
import { authorizeResourceMiddleware } from '@api/auth/middlewares/authorize-resource';
import { resolveUserMiddleware } from '@api/auth/middlewares/resolve-user';
import { Action } from '../utils/authorize';
import { handle } from '../utils/handle';
import { parseParams } from '../utils/params';

const resourceRoute = new Hono();
resourceRoute.use('*', resolveUserMiddleware);

resourceRoute.get(
  '/:namespace/:type/:name',
  authorizeResourceMiddleware(Action.READ),
  handle(async (c) => {
    const pathParams = parseParams(ResourceByIdReqSchema, c.req.param());
    return await new ResourceRepository().get(pathParams);
  })
);

resourceRoute.post(
  '/:namespace/:type/:name',
  authorizeResourceMiddleware(Action.CREATE),
  handle(async (c) => {
    const pathParams = parseParams(ResourceByIdReqSchema, c.req.param());
    return await new ResourceRepository().create(pathParams, await c.req.json());
  })
);

resourceRoute.put(
  '/:namespace/:type/:name',
  authorizeResourceMiddleware(Action.UPDATE),
  handle(async (c) => {
    const pathParams = parseParams(ResourceByIdReqSchema, c.req.param());
    return await new ResourceRepository().update(pathParams, await c.req.json());
  })
);

resourceRoute.delete(
  '/:namespace/:type/:name',
  authorizeResourceMiddleware(Action.DELETE),
  handle(async (c) => {
    const pathParams = parseParams(ResourceByIdReqSchema, c.req.param());
    return await new ResourceRepository().delete(pathParams);
  })
);

resourceRoute.get(
  '/search',
  handle(async (c) => {
    const query = ResourceSearchReqParamsSchema.parse(c.req.query());
    return await new ResourceRepository().find({
      name: query.q,
      namespace: query.namespace,
      type: query.type,
      cursor: query.cursor,
      limit: query.limit,
    });
  })
);

export { resourceRoute };
