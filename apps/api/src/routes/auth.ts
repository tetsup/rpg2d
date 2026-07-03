import 'dotenv/config';
import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { UserRepository } from '@database/repositories/user';
import type { Auth0UserInfo, SessionTokenResponse, Variables } from '@api/types/auth';
import { createSessionToken, SESSION_MAX_AGE } from '@api/auth/session-cookie';
import { env } from '@api/utils/env';
import { resolveFrontendOrigin, resolveReturnOrigin } from '@api/utils/frontend-origin';
import { resolveUserMiddleware } from '@api/auth/middlewares/resolve-user';
import { UnauthorizedError } from '@api/errors/http-error';

const authRoute = new Hono<{ Variables: Variables }>();
const buildCallbackUrl = (base: string) => String(new URL('/api/auth/callback', new URL(base).origin));
const buildRedirectUrl = (base: string) => String(new URL('/', new URL(base).origin));
const buildAuth0Url = (base: string) =>
  `https://${env.AUTH0_DOMAIN}/authorize` +
  `?response_type=code` +
  `&client_id=${env.AUTH0_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(buildCallbackUrl(base))}` +
  `&scope=openid profile email`;
const isDev = process.env.NODE_ENV !== 'production';
const secure = !isDev;
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'Lax' as const,
  secure,
  maxAge: SESSION_MAX_AGE,
  path: '/',
};
const returnOriginCookieOptions = {
  httpOnly: true,
  sameSite: 'Lax' as const,
  secure,
  maxAge: 60 * 10,
  path: '/',
};

function redirectToFrontend(c: Parameters<typeof resolveReturnOrigin>[0]) {
  return buildRedirectUrl(`${resolveReturnOrigin(c)}/`);
}

authRoute.get('/login', async (c) => {
  const returnOrigin = resolveFrontendOrigin(c);
  setCookie(c, 'return_origin', returnOrigin, returnOriginCookieOptions);

  const devUser = c.req.query('dev_user');
  if (isDev && devUser) {
    const userId = `dev|${devUser}`;
    const mockEmail = `${devUser}@example.com`;
    const dbUser = await new UserRepository().upsert({
      id: userId,
      presenceName: devUser,
      email: mockEmail,
      isAdmin: devUser === 'admin',
    });
    if (!dbUser.ok) {
      return c.text('Failed to create user', 500);
    }
    const token = await createSessionToken(userId);
    setCookie(c, 'session', token, sessionCookieOptions);
    return c.redirect(redirectToFrontend(c));
  }
  return c.redirect(buildAuth0Url(c.req.url));
});

authRoute.get('/callback', async (c) => {
  const code = c.req.query('code');
  const tokenRes = await fetch(`https://${env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: env.AUTH0_CLIENT_ID,
      client_secret: env.AUTH0_CLIENT_SECRET,
      code,
      redirect_uri: buildCallbackUrl(c.req.url),
    }),
  });
  const authToken = (await tokenRes.json()) as SessionTokenResponse;
  const userRes = await fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, {
    headers: {
      Authorization: `Bearer ${authToken.access_token}`,
    },
  });
  const user = (await userRes.json()) as Auth0UserInfo;

  let dbUser;
  try {
    dbUser = await new UserRepository().upsert({
      id: user.sub,
      presenceName: user.name ?? user.email,
      email: user.email,
      isAdmin: false,
    });
  } catch (e) {
    console.error('User upsert failed', e);
    return c.text('Internal Server Error', 500);
  }

  if (!dbUser.ok) {
    return c.text('Failed to create user', 500);
  }

  const token = await createSessionToken(user.sub);

  const redirectUrl = redirectToFrontend(c);
  setCookie(c, 'session', token, sessionCookieOptions);
  deleteCookie(c, 'return_origin', { path: '/' });

  return c.redirect(redirectUrl);
});

authRoute.get('/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' });
  deleteCookie(c, 'return_origin', { path: '/' });

  const url = new URL(`https://${env.AUTH0_DOMAIN}/v2/logout`);
  url.searchParams.set('client_id', env.AUTH0_CLIENT_ID);
  url.searchParams.set('returnTo', buildRedirectUrl(c.req.url));

  return c.redirect(redirectToFrontend(c));
});

authRoute.get('/me', resolveUserMiddleware, (c) => {
  const authUser = c.get('user');
  if (authUser == null) throw new UnauthorizedError();
  return c.json(authUser);
});

export { authRoute };
