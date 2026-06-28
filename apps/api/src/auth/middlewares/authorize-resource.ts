import { createMiddleware } from 'hono/factory';
import { ResourcePathParamsSchema } from '@schema/api/resource/common';
import type { ResourcePath } from '@sharedTypes/resource/common';
import { ResourceRepository } from '@database/repositories/resource';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@api/errors/http-error';
import type { Variables } from '@api/types/auth';
import { createAuthorize, Action } from '@api/utils/authorize';

type AuthorizeResourceMiddlewareOptions = {
  authorize: ReturnType<typeof createAuthorize>;
  getCreatedBy: (path: ResourcePath) => Promise<{ ok: true; data: string } | { ok: false; reason: string }>;
};

export function createAuthorizeResourceMiddleware({
  authorize,
  getCreatedBy,
}: AuthorizeResourceMiddlewareOptions) {
  return (action: Action) =>
    createMiddleware<{
      Variables: Variables;
    }>(async (c, next) => {
      const user = c.get('user');
      if (user == null) throw new UnauthorizedError();
      const parsePathRes = ResourcePathParamsSchema.safeParse(c.req.param());
      if (!parsePathRes.success) throw new BadRequestError(parsePathRes.error.message);

      const path = parsePathRes.data;
      let resourceCreatedBy: string | undefined;

      if (action === Action.UPDATE || action === Action.DELETE) {
        const ownership = await getCreatedBy(path);
        if (!ownership.ok) {
          if (ownership.reason === 'not_found') throw new NotFoundError();
          throw new NotFoundError();
        }
        resourceCreatedBy = ownership.data;
      }

      await authorize(user, path.namespace, action, resourceCreatedBy);
      await next();
    });
}

export function authorizeResourceMiddleware(action: Action) {
  return createAuthorizeResourceMiddleware({
    authorize,
    getCreatedBy: (path) => new ResourceRepository().getCreatedBy(path),
  })(action);
}
