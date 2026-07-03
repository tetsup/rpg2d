import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-session-secret-at-least-32-chars';
  process.env.AUTH0_DOMAIN = 'test.auth0.com';
  process.env.AUTH0_CLIENT_ID = 'test-client-id';
  process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
});

describe('session-cookie', () => {
  it('creates a verifiable session token', async () => {
    const { createSessionToken, verifySessionToken } = await import('@api/auth/session-cookie');

    const token = await createSessionToken('auth0|user-1');
    const session = await verifySessionToken(token);

    expect(session).toEqual({ sub: 'auth0|user-1' });
  });

  it('rejects tampered tokens', async () => {
    const { createSessionToken, verifySessionToken } = await import('@api/auth/session-cookie');

    const token = await createSessionToken('auth0|user-1');
    const tampered = `${token}x`;
    const session = await verifySessionToken(tampered);

    expect(session).toBeNull();
  });
});
