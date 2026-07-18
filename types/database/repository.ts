export type FlattenedError = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

export type RepositoryResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      reason: 'not_found' | 'database_error' | 'network_error' | 'unknown';
      error?: unknown;
      detail?: object;
    }
  | {
      ok: false;
      reason: 'already_exists';
      error?: unknown;
      detail: { fields: string[] };
    }
  | {
      ok: false;
      reason: 'validation_failed';
      error?: unknown;
      detail: { errors: FlattenedError };
    };
