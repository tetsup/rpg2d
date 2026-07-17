import { NoResultError } from 'kysely';
import { DatabaseError } from 'pg';
import { ZodError } from 'zod';

export type RepositoryResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      reason: 'not_found' | 'already_exists' | 'validation_failed' | 'database_error' | 'network_error' | 'unknown';
      error?: unknown;
      detail?: object;
    };

export async function repositorySafe<T>(callback: () => Promise<T>): Promise<RepositoryResult<T>> {
  try {
    const data = await callback();
    return { ok: true, data };
  } catch (error) {
    return normalizeRepositoryError(error);
  }
}

function normalizeRepositoryError(error: unknown): RepositoryResult<never> {
  // application/domain
  if (error instanceof NoResultError) {
    return { ok: false, reason: 'not_found', error };
  }

  if (error instanceof ZodError) return { ok: false, reason: 'validation_failed', error, detail: error.issues };

  if (error instanceof DatabaseError) {
    switch (error.code) {
      case '23505':
        return {
          ok: false,
          reason: 'already_exists',
          error,
        };

      case '23503':
      case '23502':
      case '23514':
        return {
          ok: false,
          reason: 'validation_failed',
          error,
        };

      case '40001':
      case '40P01':
        return {
          ok: false,
          reason: 'database_error',
          error,
        };
    }

    return {
      ok: false,
      reason: 'database_error',
      error,
    };
  }

  // fallback
  return { ok: false, reason: 'unknown', error };
}
