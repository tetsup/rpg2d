import { z } from 'zod';

const schema = z.object({
  AUTH0_DOMAIN: z.string(),
  AUTH0_CLIENT_ID: z.string(),
  AUTH0_CLIENT_SECRET: z.string(),
  FRONTEND_ORIGIN: z.url().default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(32),
});

export const env = schema.parse(process.env);
