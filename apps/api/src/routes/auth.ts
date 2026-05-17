import { Hono } from 'hono';
import { sessionStore } from '@api/auth/session';
import { authMiddleware } from '@api/auth/middleware';
import type { Auth0TokenResponse, Auth0User, Variables } from 'apps/api/types/auth';
import { setCookie } from 'hono/cookie';

const authRoute = new Hono<{ Variables: Variables }>();

authRoute.get('/login', (c) => {
  const domain = process.env.AUTH0_DOMAIN!;
  const clientId = process.env.AUTH0_CLIENT_ID!;
  const redirectUri = process.env.AUTH0_CALLBACK_URL!;

  const url =
    `https://${domain}/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=openid profile email`;

  return c.redirect(url);
});

authRoute.get('/callback', async (c) => {
  const code = c.req.query('code');

  const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code,
      redirect_uri: process.env.AUTH0_CALLBACK_URL,
    }),
  });

  const token = (await tokenRes.json()) as Auth0TokenResponse;

  const userRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  const user = (await userRes.json()) as Auth0User;

  const sessionId = crypto.randomUUID();

  sessionStore.set(sessionId, {
    id: user.sub,
    email: user.email,
    name: user.name,
    roles: [],
  });

  setCookie(c, 'session', sessionId, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: false, // prodでtrue
  });

  return c.redirect('/');
});

authRoute.get('/me', authMiddleware, (c) => {
  return c.json({
    user: c.get('user'),
  });
});

export { authRoute };
