import { createMiddleware } from 'hono/factory';
import { ResourcePathParamsSchema } from '@schema/api/resource/common';
import { BadRequestError } from '@api/errors/http-error';
import type { Variables } from '@api/types/auth';
import { Action } from '@api/utils/authorize';
import { ensureResourceAccess } from '@api/utils/resource-access';

type AuthorizeResourceMiddlewareOptions = {
  ensureResourceAccess: typeof ensureResourceAccess;
};

export function createAuthorizeResourceMiddleware({
  ensureResourceAccess,
}: AuthorizeResourceMiddlewareOptions) {
  return (action: Action) =>
    createMiddleware<{
      Variables: Variables;
    }>(async (c, next) => {
      const parsePathRes = ResourcePathParamsSchema.safeParse(c.req.param());
      if (!parsePathRes.success) throw new BadRequestError(parsePathRes.error.message);
      await ensureResourceAccess(c.get('user'), parsePathRes.data, action);
      await next();
    });
}

export function authorizeResourceMiddleware(action: Action) {
  return createAuthorizeResourceMiddleware({ ensureResourceAccess })(action);
}
