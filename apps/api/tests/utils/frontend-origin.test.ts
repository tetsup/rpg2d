import { beforeAll, describe, expect, it } from 'vitest';
import { Hono } from 'hono';

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-session-secret-at-least-32-chars';
  process.env.AUTH0_DOMAIN = 'test.auth0.com';
  process.env.AUTH0_CLIENT_ID = 'test-client-id';
  process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
  process.env.FRONTEND_ORIGIN = 'http://localhost:5173,https://editor.example.com';
});

describe('frontend-origin', () => {
  it('accepts origins from the allowlist', async () => {
    const { isAllowedFrontendOrigin, createCorsOriginValidator } = await import('@api/utils/frontend-origin');

    expect(isAllowedFrontendOrigin('http://localhost:5173')).toBe(true);
    expect(isAllowedFrontendOrigin('https://editor.example.com')).toBe(true);
    expect(isAllowedFrontendOrigin('https://evil.example.com')).toBe(false);

    const validate = createCorsOriginValidator();
    expect(validate('https://editor.example.com')).toBe('https://editor.example.com');
    expect(validate('https://evil.example.com')).toBe('');
  });

  it('resolves frontend origin from request headers', async () => {
    const { resolveFrontendOrigin } = await import('@api/utils/frontend-origin');
    const app = new Hono();

    app.get('/test', (c) => c.json({ origin: resolveFrontendOrigin(c) }));

    const response = await app.request('/test', {
      headers: { Origin: 'https://editor.example.com' },
    });

    expect(await response.json()).toEqual({ origin: 'https://editor.example.com' });
  });
});
