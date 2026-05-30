import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { UserRepository } from '@database/repositories/user';
import type { Auth0UserInfo, SessionTokenResponse, Variables } from '@api/types/auth';
import { sessionStore } from '@api/auth/stores/session';
import { resolveUserMiddleware } from '@api/auth/middlewares/resolve-user';
import { UnauthorizedError } from '@api/errors/http-error';

const authRoute = new Hono<{ Variables: Variables }>();
const domain = process.env.AUTH_DOMAIN!;
const clientId = process.env.AUTH_CLIENT_ID!;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const redirectUri = process.env.AUTH_CALLBACK_URL!;
const auth0Url =
  `https://${domain}/authorize` +
  `?response_type=code` +
  `&client_id=${clientId}` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&scope=openid profile email`;
const isDev = process.env.NODE_ENV !== 'production';
const secure = !isDev;

authRoute.get('/login', async (c) => {
  const devUser = c.req.query('dev_user');
  if (isDev && devUser) {
    const mockEmail = `${devUser}@example.com`;
    await new UserRepository().upsert({
      sub: `dev|${devUser}`,
      name: devUser,
      email: mockEmail,
      roles: devUser === 'admin' ? ['admin'] : ['user'],
    });

    const sessionId = crypto.randomUUID();
    sessionStore.set(sessionId, { sub: `dev|${devUser}` });
    setCookie(c, 'session', sessionId, { httpOnly: true, sameSite: 'Lax', secure });

    return c.redirect('/');
  }

  return c.redirect(auth0Url);
});

authRoute.get('/callback', async (c) => {
  const code = c.req.query('code');
  const tokenRes = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const token = (await tokenRes.json()) as SessionTokenResponse;
  const userRes = await fetch(`https://${domain}/userinfo`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });
  const user = (await userRes.json()) as Auth0UserInfo;
  await new UserRepository().upsert({
    sub: user.sub,
    email: user.email,
    email_verified: user.email_verified,
  });
  const sessionId = crypto.randomUUID();

  sessionStore.set(sessionId, {
    sub: user.sub,
  });

  setCookie(c, 'session', sessionId, {
    httpOnly: true,
    sameSite: 'Lax',
    secure,
  });

  return c.redirect('/');
});

authRoute.get('/me', resolveUserMiddleware, (c) => {
  const authUser = c.get('user');
  if (authUser == null) throw new UnauthorizedError();
  return c.json(authUser);
});

export { authRoute };
