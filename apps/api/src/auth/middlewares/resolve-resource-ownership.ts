import { createMiddleware } from 'hono/factory';
import { ResourcePathParamsSchema } from '@schema/api/resource/common';
import type { ResourcePath } from '@sharedTypes/resource/common';
import type { RepositoryResult } from '@database/repositories/utils/common';
import { ResourceRepository } from '@database/repositories/resource';
import { ApiError, BadRequestError, NotFoundError } from '@api/errors/http-error';
import type { Variables } from '@api/types/auth';

type ResolveResourceOwnershipMiddlewareOptions = {
  getCreatedBy: (path: ResourcePath) => Promise<RepositoryResult<string>>;
};

export function createResolveResourceOwnershipMiddleware({
  getCreatedBy,
}: ResolveResourceOwnershipMiddlewareOptions) {
  return createMiddleware<{
    Variables: Variables;
  }>(async (c, next) => {
    const parsePathRes = ResourcePathParamsSchema.safeParse(c.req.param());
    if (!parsePathRes.success) throw new BadRequestError(parsePathRes.error.message);

    const ownership = await getCreatedBy(parsePathRes.data);
    if (!ownership.ok) {
      if (ownership.reason === 'not_found') throw new NotFoundError();
      throw new ApiError(503);
    }

    c.set('resourceCreatedBy', ownership.data);
    await next();
  });
}

export const resolveResourceOwnershipMiddleware = createResolveResourceOwnershipMiddleware({
  getCreatedBy: (path) => new ResourceRepository().getCreatedBy(path),
});
