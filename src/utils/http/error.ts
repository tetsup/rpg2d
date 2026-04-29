export class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, body?: unknown, message?: string, cause?: unknown) {
    super(message ?? `HTTP ${status}`, { cause });

    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export class ParseError extends Error {
  body?: unknown;

  constructor(body?: unknown, message?: string, cause?: unknown) {
    super(message ?? 'Parse Error', { cause });

    this.name = 'ParseError';
    this.body = body;
  }
}
