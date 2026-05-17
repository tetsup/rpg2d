import type { Context } from 'hono';
import { ApiError } from '../errors/http-error';

export function handle<T>(fn: (c: Context) => Promise<T>) {
  return async (c: Context) => {
    try {
      const data = await fn(c);

      return c.json({
        ok: true,
        data,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        return c.json(
          {
            ok: false,
            error: err.message,
          },
          err.status
        );
      }
      console.error(err);
      return c.json(
        {
          ok: false,
          error: 'internal_error',
        },
        500
      );
    }
  };
}
