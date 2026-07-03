import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { env } from '@api/utils/env';

export function isAllowedFrontendOrigin(origin: string): boolean {
  return env.frontendOrigins.includes(origin);
}

export function resolveFrontendOrigin(c: Context): string {
  const origin = c.req.header('Origin');
  if (origin && isAllowedFrontendOrigin(origin)) return origin;

  const referer = c.req.header('Referer');
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (isAllowedFrontendOrigin(refererOrigin)) return refererOrigin;
    } catch {
      // ignore invalid referer
    }
  }

  return env.frontendOrigins[0];
}

export function resolveReturnOrigin(c: Context): string {
  const returnOrigin = getCookie(c, 'return_origin');
  if (returnOrigin && isAllowedFrontendOrigin(returnOrigin)) return returnOrigin;
  return resolveFrontendOrigin(c);
}

export function createCorsOriginValidator() {
  return (origin: string) => (isAllowedFrontendOrigin(origin) ? origin : '');
}
