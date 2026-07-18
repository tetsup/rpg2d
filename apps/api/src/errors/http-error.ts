import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ConflictErrorResponse, ErrorResponseMap, ValidationErrorResponse } from '@sharedTypes/api/response';

export class ApiError<C extends keyof ErrorResponseMap> extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly body: ErrorResponseMap[C]
  ) {
    super();
  }
}

export class BadRequestError extends ApiError<'BAD_REQUEST'> {
  constructor() {
    super(400, { code: 'BAD_REQUEST' });
  }
}

export class UnauthorizedError extends ApiError<'UNAUTHORIZED'> {
  constructor() {
    super(401, { code: 'UNAUTHORIZED' });
  }
}

export class ForbiddenError extends ApiError<'FORBIDDEN'> {
  constructor() {
    super(403, { code: 'FORBIDDEN' });
  }
}

export class NotFoundError extends ApiError<'NOT_FOUND'> {
  constructor() {
    super(404, { code: 'NOT_FOUND' });
  }
}

export class ConflictError extends ApiError<'CONFLICT'> {
  constructor(body: ConflictErrorResponse) {
    super(409, { code: 'CONFLICT', detail: body });
  }
}

export class UnprocessableEntityError extends ApiError<'VALIDATION_ERROR'> {
  constructor(body: ValidationErrorResponse) {
    super(422, { code: 'VALIDATION_ERROR', detail: body });
  }
}

export class BadGatewayError extends ApiError<'BAD_GATEWAY'> {
  constructor() {
    super(502, { code: 'BAD_GATEWAY' });
  }
}

export class ServiceUnavailableError extends ApiError<'SERVICE_UNAVAILABLE'> {
  constructor() {
    super(503, { code: 'SERVICE_UNAVAILABLE' });
  }
}

export class InternalServerError extends ApiError<'INTERNAL_SERVER_ERROR'> {
  constructor() {
    super(500, { code: 'INTERNAL_SERVER_ERROR' });
  }
}
