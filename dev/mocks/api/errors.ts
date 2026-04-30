import { HttpResponse } from 'msw';

export class NotFoundError extends Error {
  constructor(options?: ErrorOptions) {
    super('not found', options);
  }
}
export class BadRequestError extends Error {
  constructor(options?: ErrorOptions) {
    super('bad request', options);
  }
}
export class InternalServerError extends Error {
  constructor(options?: ErrorOptions) {
    super('internal server error', options);
  }
}

const NotFoundErrorResponse = (cause: unknown) => HttpResponse.json({ error: 'not found', cause }, { status: 404 });

const BadRequestErrorResponse = (cause: unknown) => HttpResponse.json({ error: 'bad request', cause }, { status: 400 });

const InternalServerErrorResponse = (message?: string, cause?: unknown) =>
  HttpResponse.json({ error: message ?? 'internal server error', cause }, { status: 500 });

const handleError = (e: Error) => {
  if (e instanceof NotFoundError) return NotFoundErrorResponse(e.cause);
  if (e instanceof BadRequestError) return BadRequestErrorResponse(e.cause);
  if (e instanceof InternalServerError) return InternalServerErrorResponse(e.message, e.cause);
  return InternalServerErrorResponse();
};

export const execWithHandleError = async (func: () => Promise<HttpResponse<any>>): Promise<HttpResponse<any>> => {
  try {
    return await func();
  } catch (e) {
    return handleError(e as Error);
  }
};
