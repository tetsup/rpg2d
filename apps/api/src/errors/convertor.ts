import type { RepositoryError } from '@sharedTypes/api/response';
import {
  BadGatewayError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  UnprocessableEntityError,
} from './http-error';

export function toApiError<T>(result: RepositoryError<T>) {
  switch (result.reason) {
    case 'not_found':
      return new NotFoundError();

    case 'already_exists':
      return new ConflictError(result.detail);

    case 'validation_failed':
      return new UnprocessableEntityError(result.detail);

    case 'network_error':
      return new BadGatewayError();

    case 'database_error':
      return new ServiceUnavailableError();

    default:
      return new InternalServerError();
  }
}
