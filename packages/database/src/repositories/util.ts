import { MongoServerError, MongoNetworkError, MongoServerSelectionError, MongoTopologyClosedError } from 'mongodb';
import { ZodError } from 'zod';

export type RepositoryResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      reason: 'not_found' | 'already_exists' | 'validation_failed' | 'database_error' | 'network_error' | 'unknown';
      error?: unknown;
    };

export class RepositoryNotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'RepositoryNotFoundError';
  }
}

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
  if (error instanceof RepositoryNotFoundError) {
    return { ok: false, reason: 'not_found', error };
  }

  if (error instanceof ZodError) return { ok: false, reason: 'validation_failed', error };

  // network
  if (
    error instanceof MongoNetworkError ||
    error instanceof MongoServerSelectionError ||
    error instanceof MongoTopologyClosedError
  )
    return { ok: false, reason: 'network_error', error };

  // mongodb server
  if (error instanceof MongoServerError) {
    switch (error.code) {
      case 11000:
        return { ok: false, reason: 'already_exists', error };
      // known database-side errors
      case 6: // HostUnreachable
      case 7: // HostNotFound
      case 50: // ExceededTimeLimit
      case 89: // NetworkTimeout
      case 91: // ShutdownInProgress
      case 112: // WriteConflict
      case 11600: // InterruptedAtShutdown
      case 11602: // InterruptedDueToReplStateChange
      case 13435: // NotPrimaryNoSecondaryOk
      case 13436: // NotPrimaryOrSecondary
      case 13: // Unauthorized
        return { ok: false, reason: 'database_error', error };
    }
  }

  // fallback
  return { ok: false, reason: 'unknown', error };
}
