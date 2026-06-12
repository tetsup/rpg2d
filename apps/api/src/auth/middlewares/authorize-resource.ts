import { createMiddleware } from 'hono/factory';
import { ResourcePathParamsSchema } from '@schema/api/resource/common';
import { BadRequestError, UnauthorizedError } from '@api/errors/http-error';
import type { Variables } from '@api/types/auth';
import { authorize, type Action } from '@api/utils/authorize';

type AuthorizeResourceMiddlewareOptions = {
  authorize: typeof authorize;
};

export function createAuthorizeResourceMiddleware({ authorize }: AuthorizeResourceMiddlewareOptions) {
  return (action: Action) =>
    createMiddleware<{
      Variables: Variables;
    }>(async (c, next) => {
      const user = c.get('user');
      if (user == null) throw new UnauthorizedError();
      const parsePathRes = ResourcePathParamsSchema.safeParse(c.req.param());
      if (!parsePathRes.success) throw new BadRequestError(parsePathRes.error.message);
      await authorize(user, parsePathRes.data.namespace, action);
      await next();
    });
}

export function authorizeResourceMiddleware(action: Action) {
  return createAuthorizeResourceMiddleware({ authorize })(action);
}
