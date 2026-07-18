import type { Context, Env } from 'hono';
import type { RepositoryResult } from '@sharedTypes/database/repository';
import { toApiError } from '@api/errors/convertor';
import { ApiError } from '../errors/http-error';

export function handle<T, E extends Env = any>(fn: (c: Context<E>) => Promise<RepositoryResult<T>>) {
  return async (c: Context<E>) => {
    try {
      const result = await fn(c);

      if (!result.ok) {
        const error = toApiError(result);
        return c.json(error.body, error.status);
      }

      return c.json(result.data ?? {}, 200);
    } catch (err) {
      console.error(err);

      if (err instanceof ApiError) {
        return c.json(err.body, err.status);
      }

      return c.json({ code: 'INTERNAL_SERVER_ERROR' }, 500);
    }
  };
}
