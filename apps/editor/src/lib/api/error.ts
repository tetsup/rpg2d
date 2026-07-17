export class ApiError extends Error {
  constructor(
    readonly response: Response,
    readonly body: unknown
  ) {
    super(response.statusText);
  }
}
