import { Hono } from 'hono';
import { createAuthorizeResourceMiddleware } from '@api/auth/middlewares/authorize-resource';
import { Action, createAuthorize } from '@api/utils/authorize';
import { ApiError } from '@api/errors/http-error';
import type { UserDocument } from '@sharedTypes/database/collection';

const user: UserDocument = {
  id: 'user-a',
  presenceName: 'User A',
  email: 'a@example.com',
  avatar: '',
  isAdmin: false,
  roles: [],
};

function createTestApp(options: {
  createdBy?: string;
  capabilities: { read: boolean; create: boolean; update: boolean; admin: boolean };
}) {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json({ error: err.message }, err.status);
    }
    return c.json({ error: 'internal_error' }, 500);
  });

  app.put(
    '/resources/:namespace/:type/:name',
    async (c, next) => {
      c.set('user', user);
      if (options.createdBy != null) {
        c.set('resourceCreatedBy', options.createdBy);
      }
      await next();
    },
    createAuthorizeResourceMiddleware({
      authorize: createAuthorize({
        checkPermissions: async () => ({ ok: true as const, data: options.capabilities }),
      }),
    })(Action.UPDATE),
    (c) => c.json({ ok: true })
  );

  return app;
}

describe('authorizeResourceMiddleware', () => {
  it('returns 403 when a creator updates another users resource', async () => {
    const app = createTestApp({
      createdBy: 'other-user',
      capabilities: { read: true, create: true, update: false, admin: false },
    });

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(403);
  });

  it('allows a creator to update their own resource', async () => {
    const app = createTestApp({
      createdBy: user.id,
      capabilities: { read: true, create: true, update: false, admin: false },
    });

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(200);
  });

  it('returns 500 when ownership was not resolved before authorize', async () => {
    const app = createTestApp({
      capabilities: { read: true, create: true, update: true, admin: false },
    });

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(500);
  });
});
