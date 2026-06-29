import { createMiddleware } from 'hono/factory';
import { ResourcePathParamsSchema } from '@schema/api/resource/common';
import { BadRequestError, UnauthorizedError, ApiError } from '@api/errors/http-error';
import type { Variables } from '@api/types/auth';
import { createAuthorize, Action } from '@api/utils/authorize';

type AuthorizeResourceMiddlewareOptions = {
  authorize: ReturnType<typeof createAuthorize>;
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

      const requiresOwnership = action === Action.UPDATE || action === Action.DELETE;
      const resourceCreatedBy = requiresOwnership ? c.get('resourceCreatedBy') : undefined;

      if (requiresOwnership && resourceCreatedBy == null) {
        throw new ApiError(500, 'resourceCreatedBy must be resolved before authorize');
      }

      await authorize(user, parsePathRes.data.namespace, action, resourceCreatedBy);
      await next();
    });
}

export function authorizeResourceMiddleware(action: Action) {
  return createAuthorizeResourceMiddleware({ authorize })(action);
}
