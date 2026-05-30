import type { Context, Env } from 'hono';
import { ApiError } from '../errors/http-error';

export function handle<T, E extends Env = any>(fn: (c: Context<E>) => Promise<T>) {
  return async (c: Context<E>) => {
    try {
      const data = await fn(c);
      return c.json(data ?? {}, c.req.method === 'POST' ? 201 : 200);
    } catch (err) {
      if (err instanceof ApiError) {
        return c.json({ error: err.message }, err.status);
      }
      console.error(err);
      return c.json({ error: 'internal_error' }, 500);
    }
  };
}
