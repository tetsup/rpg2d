import { Hono } from 'hono';
import { createAuthorizeResourceMiddleware } from '@api/auth/middlewares/authorize-resource';
import { Action, createAuthorize } from '@api/utils/authorize';
import { ApiError } from '@api/errors/http-error';
import type { UserDocument } from '@sharedTypes/database/collection';
import type { RepositoryResult } from '@database/repositories/utils/common';

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
  ownership?: RepositoryResult<string>;
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
      await next();
    },
    createAuthorizeResourceMiddleware({
      authorize: createAuthorize({
        checkPermissions: async () => ({ ok: true as const, data: options.capabilities }),
      }),
      getCreatedBy: async () => {
        if (options.ownership) return options.ownership;
        return { ok: true as const, data: options.createdBy ?? user.id };
      },
    })(Action.UPDATE),
    (c) => c.json({ ok: true })
  );

  return app;
}

describe('authorizeResourceMiddleware', () => {
  it('returns 404 when the resource does not exist', async () => {
    const app = createTestApp({
      ownership: { ok: false, reason: 'not_found' },
      capabilities: { read: true, create: true, update: true, admin: false },
    });

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(404);
  });

  it('returns 403 when a creator updates another users resource', async () => {
    const app = createTestApp({
      createdBy: 'other-user',
      capabilities: { read: true, create: true, update: false, admin: false },
    });

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(403);
  });

  it('returns 503 when ownership lookup fails unexpectedly', async () => {
    const app = createTestApp({
      ownership: { ok: false, reason: 'database_error' },
      capabilities: { read: true, create: true, update: true, admin: false },
    });

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(503);
  });

  it('allows a creator to update their own resource', async () => {
    const app = createTestApp({
      createdBy: user.id,
      capabilities: { read: true, create: true, update: false, admin: false },
    });

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(200);
  });
});
