import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';

import { sessionStore } from './session';
import type { Variables } from '../../types/auth';

const isDev = process.env.NODE_ENV !== 'production';

export const resolveUserMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  /**
   * DEV BYPASS
   */
  if (isDev) {
    const devUser = c.req.header('x-dev-user');
    const devRoles = c.req.header('x-dev-roles');

    if (devUser) {
      c.set('user', {
        id: devUser,
        roles: devRoles?.split(',') ?? ['admin'],
      });

      return next();
    }
  }

  /**
   * NORMAL SESSION AUTH
   */
  const sessionId = getCookie(c, 'session');

  if (sessionId) {
    const user = sessionStore.get(sessionId);

    if (user) {
      c.set('user', user);
    }
  }

  await next();
});
