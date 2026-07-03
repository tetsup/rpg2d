import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { UserRepository } from '@database/repositories/user';
import type { Variables } from '@api/types/auth';
import { verifySessionToken } from '@api/auth/session-cookie';

export const resolveUserMiddleware = createMiddleware<{
  Variables: Variables;
}>(async (c, next) => {
  const token = getCookie(c, 'session');
  if (!token) return next();
  const session = await verifySessionToken(token);
  if (!session) return next();

  const res = await new UserRepository().get(session.sub);
  if (!res.ok || !res.data) return next();
  c.set('user', res.data);
  await next();
});
