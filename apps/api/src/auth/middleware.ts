import { createMiddleware } from 'hono/factory';
import { UnauthorizedError } from '../errors/http-error';

export const authMiddleware = createMiddleware(async (c, next) => {
  const user = c.get('user');
  if (!user) {
    throw new UnauthorizedError();
  }
  await next();
});
