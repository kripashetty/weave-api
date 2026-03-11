// ADR-01: All error types live here so every module uses a consistent shape.
// Route handlers call toHttpResponse() to turn any AppError into the wire format.

export const ErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'
    // Preserve prototype chain so instanceof checks work after transpilation
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.NOT_FOUND, 404, context)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.UNAUTHORIZED, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.FORBIDDEN, 403)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.CONFLICT, 409, context)
    this.name = 'ConflictError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, context)
    this.name = 'ValidationError'
  }
}

export class InternalError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, context)
    this.name = 'InternalError'
  }
}

// ─── Result type ─────────────────────────────────────────────────────────────

export type Result<T, E extends AppError = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E extends AppError>(error: E): Result<never, E> {
  return { ok: false, error }
}

// ─── HTTP response shape ──────────────────────────────────────────────────────

export interface HttpErrorBody {
  error: { code: string; message: string }
}

// Converts any AppError to the consistent wire format used by all route handlers:
// { error: { code: "NOT_FOUND", message: "Goal not found" } }
export function toHttpResponse(error: AppError): HttpErrorBody {
  return { error: { code: error.code, message: error.message } }
}
