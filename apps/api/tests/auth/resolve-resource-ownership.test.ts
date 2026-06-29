import { Hono } from 'hono';
import { createResolveResourceOwnershipMiddleware } from '@api/auth/middlewares/resolve-resource-ownership';
import { ApiError } from '@api/errors/http-error';
import type { RepositoryResult } from '@database/repositories/utils/common';

function createTestApp(getCreatedBy: () => Promise<RepositoryResult<string>>) {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json({ error: err.message }, err.status);
    }
    return c.json({ error: 'internal_error' }, 500);
  });

  app.put(
    '/resources/:namespace/:type/:name',
    createResolveResourceOwnershipMiddleware({ getCreatedBy }),
    (c) => c.json({ createdBy: c.get('resourceCreatedBy') })
  );

  return app;
}

describe('resolveResourceOwnershipMiddleware', () => {
  it('returns 404 when the resource does not exist', async () => {
    const app = createTestApp(async () => ({ ok: false, reason: 'not_found' }));

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(404);
  });

  it('returns 503 when ownership lookup fails unexpectedly', async () => {
    const app = createTestApp(async () => ({ ok: false, reason: 'database_error' }));

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(503);
  });

  it('sets resourceCreatedBy on the request context', async () => {
    const app = createTestApp(async () => ({ ok: true, data: 'owner-user' }));

    const response = await app.request('/resources/sample/player/hero', { method: 'PUT' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ createdBy: 'owner-user' });
  });
});
