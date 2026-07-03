import { SignJWT, jwtVerify } from 'jose';
import { env } from '@api/utils/env';

const SESSION_TTL = '30d';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function secretKey() {
  return new TextEncoder().encode(env.SESSION_SECRET);
}

export async function createSessionToken(sub: string): Promise<string> {
  return new SignJWT({ sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.sub !== 'string') return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
