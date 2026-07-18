import type { ErrorResponseMap } from '@sharedTypes/api/response';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ErrorResponseMap[keyof ErrorResponseMap]
  ) {
    super();
  }
}
