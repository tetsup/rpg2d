import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { UserRepository } from '@database/repositories/user';
import type { Variables } from '@api/types/auth';
import { sessionStore } from '../stores/session';

export const resolveUserMiddleware = createMiddleware<{
  Variables: Variables;
}>(async (c, next) => {
  /* SESSION */
  const sessionId = getCookie(c, 'session');
  if (!sessionId) return next();
  const sessionUser = sessionStore.get(sessionId);
  if (!sessionUser) return next();

  /* DB RESOLVE */
  const res = await new UserRepository().get(sessionUser.sub);
  if (!res.ok || !res.data) return next();
  c.set('user', res.data);
  await next();
});
