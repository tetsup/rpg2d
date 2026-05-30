import { createMiddleware } from 'hono/factory';
import { splitId } from '@schema/resource/common/base';
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
      const resourceId = c.req.param('id');
      if (resourceId == null) throw new BadRequestError();
      const parsed = splitId.parse(resourceId);
      await authorize(user, parsed.namespace, action);
      await next();
    });
}

export function authorizeResourceMiddleware(action: Action) {
  return createAuthorizeResourceMiddleware({ authorize })(action);
}
