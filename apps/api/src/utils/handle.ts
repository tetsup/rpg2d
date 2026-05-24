import type { Context } from 'hono';
import { ApiError } from '../errors/http-error';

export function handle<T>(fn: (c: Context) => Promise<T>) {
  return async (c: Context) => {
    try {
      const data = await fn(c);
      console.log(data);
      return c.json(data);
    } catch (err) {
      if (err instanceof ApiError) {
        return c.json(
          {
            error: err.message,
          },
          err.status
        );
      }
      console.error(err);
      return c.json(
        {
          error: 'internal_error',
        },
        500
      );
    }
  };
}
