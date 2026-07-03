import { z } from 'zod';

function parseFrontendOrigins(value: string): string[] {
  const origins = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return z.array(z.url()).min(1).parse(origins);
}

const schema = z.object({
  AUTH0_DOMAIN: z.string(),
  AUTH0_CLIENT_ID: z.string(),
  AUTH0_CLIENT_SECRET: z.string(),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(32),
});

const parsed = schema.parse(process.env);

export const env = {
  ...parsed,
  frontendOrigins: parseFrontendOrigins(parsed.FRONTEND_ORIGIN),
};
