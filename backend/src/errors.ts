// Domain-level error with an associated HTTP status code and optional details.
// The central error handler converts these into consistent JSON responses.
export class AppError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

export const notFound = (message: string) => new AppError(404, message);
export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, message, details);
