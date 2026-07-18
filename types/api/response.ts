import type { FlattenedError, RepositoryResult } from '@sharedTypes/database/repository';

export type RepositoryError<T> = Extract<RepositoryResult<T>, { ok: false }>;

export type ValidationErrorResponse = {
  errors: FlattenedError;
};

export type ConflictErrorResponse = {
  fields?: string[];
};

export type ErrorResponseMap = {
  BAD_REQUEST: {
    code: 'BAD_REQUEST';
  };
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED';
  };
  FORBIDDEN: {
    code: 'FORBIDDEN';
  };
  NOT_FOUND: {
    code: 'NOT_FOUND';
  };
  CONFLICT: {
    code: 'CONFLICT';
    detail: ConflictErrorResponse;
  };
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR';
    detail: ValidationErrorResponse;
  };
  BAD_GATEWAY: {
    code: 'BAD_GATEWAY';
  };
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE';
  };
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR';
  };
};

export type ErrorResponseBody = ErrorResponseMap[keyof ErrorResponseMap];
