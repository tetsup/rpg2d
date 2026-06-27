import type { Context, Env } from 'hono';
import { RepositoryResult } from '@database/repositories/utils/common';
import { ApiError } from '../errors/http-error';

function resolveResponse(res: RepositoryResult<any>, c: Context<any>) {
  if (res.ok) return c.json(res.data ?? {}, 200);
  else {
    switch (res.reason) {
      case 'not_found':
        return c.json(res.detail, 404);
      case 'validation_failed':
        return c.json(res.detail, 422);
      case 'already_exists':
        return c.json(res.detail, 409);
      case 'network_error':
        return c.json(res.detail, 502);
      case 'database_error':
        return c.json(res.detail, 503);
      default:
        return c.json(res.detail, 500);
    }
  }
}

export function handle<T, E extends Env = any>(fn: (c: Context<E>) => Promise<RepositoryResult<T>>) {
  return async (c: Context<E>) => {
    try {
      const result = await fn(c);
      console.log(result);
      const response = resolveResponse(result, c);
      console.log(response);
      return response;
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        return c.json({ error: err.message }, err.status);
      }
      return c.json({ error: 'internal_error' }, 500);
    }
  };
}
