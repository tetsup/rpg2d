import { createMiddleware } from 'hono/factory';
import { ResourcePathSchema } from '@schema/resource/common/base';
import { BadRequestError } from '@api/errors/http-error';
import type { Variables } from '@api/types/auth';
import type { Action } from '@api/utils/authorize';
import { ensureResourceAccess } from '@api/utils/resource-access';

export function authorizeResourceMiddleware(action: Action) {
  return createMiddleware<{
    Variables: Variables;
  }>(async (c, next) => {
    const res = ResourcePathSchema.safeParse(c.req.param());
    if (!res.success) throw new BadRequestError();
    await ensureResourceAccess(c.get('user'), res.data, action);
    await next();
  });
}
