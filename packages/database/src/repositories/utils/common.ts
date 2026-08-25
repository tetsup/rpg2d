import { NoResultError } from 'kysely';
import { DatabaseError } from 'pg';
import z from 'zod';
import type { RepositoryResult } from '@sharedTypes/database/repository';

export async function repositorySafe<T>(callback: () => Promise<T>): Promise<RepositoryResult<T>> {
  try {
    const data = await callback();
    return { ok: true, data };
  } catch (error) {
    console.error(error);
    return normalizeRepositoryError(error);
  }
}

function normalizeRepositoryError(error: unknown): RepositoryResult<never> {
  // application/domain
  if (error instanceof NoResultError) {
    return { ok: false, reason: 'not_found', error };
  }

  if (error instanceof z.ZodError)
    return { ok: false, reason: 'validation_failed', error, detail: { errors: z.flattenError(error) } };

  if (error instanceof DatabaseError) {
    switch (error.code) {
      case '23505':
        return {
          ok: false,
          reason: 'already_exists',
          error,
          detail: { fields: error.column ? [error.column] : [] },
        };

      case '23503':
      case '23502':
      case '23514':
        return {
          ok: false,
          reason: 'validation_failed',
          error,
          detail: {
            errors: {
              formErrors: [],
              fieldErrors: error.column ? { [error.column]: error.detail ? [error.detail] : [] } : {},
            },
          },
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
