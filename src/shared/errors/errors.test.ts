import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  InternalError,
  ErrorCode,
  ok,
  err,
  toHttpResponse,
  type Result,
} from './index.js';

describe('AppError', () => {
  it('sets all properties correctly', () => {
    const error = new AppError('something broke', ErrorCode.INTERNAL_ERROR, 500, { id: '123' });
    expect(error.message).toBe('something broke');
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.context).toEqual({ id: '123' });
    expect(error.name).toBe('AppError');
  });

  it('is an instance of Error', () => {
    const error = new AppError('test', ErrorCode.NOT_FOUND, 404);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('Error subclasses', () => {
  it('NotFoundError has correct code and status', () => {
    const e = new NotFoundError('Goal not found', { goalId: 'abc' });
    expect(e.statusCode).toBe(404);
    expect(e.code).toBe(ErrorCode.NOT_FOUND);
    expect(e.context).toEqual({ goalId: 'abc' });
    expect(e).toBeInstanceOf(AppError);
    expect(e).toBeInstanceOf(NotFoundError);
  });

  it('UnauthorizedError has correct code and status', () => {
    const e = new UnauthorizedError('Invalid token');
    expect(e.statusCode).toBe(401);
    expect(e.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('ForbiddenError has correct code and status', () => {
    const e = new ForbiddenError('Insufficient role');
    expect(e.statusCode).toBe(403);
    expect(e.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('ConflictError has correct code and status', () => {
    const e = new ConflictError('Email already exists');
    expect(e.statusCode).toBe(409);
    expect(e.code).toBe(ErrorCode.CONFLICT);
  });

  it('ValidationError has correct code and status', () => {
    const e = new ValidationError('Invalid input', { field: 'email' });
    expect(e.statusCode).toBe(400);
    expect(e.code).toBe(ErrorCode.VALIDATION_ERROR);
  });

  it('InternalError has correct code and status', () => {
    const e = new InternalError('Unexpected failure');
    expect(e.statusCode).toBe(500);
    expect(e.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('instanceof checks work correctly through prototype chain', () => {
    const e = new NotFoundError('test');
    expect(e).toBeInstanceOf(NotFoundError);
    expect(e).toBeInstanceOf(AppError);
    expect(e).toBeInstanceOf(Error);
    expect(e).not.toBeInstanceOf(UnauthorizedError);
  });
});

describe('Result helpers', () => {
  it('ok wraps a value in a success result', () => {
    const result = ok('hello');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('hello');
    }
  });

  it('ok works with objects', () => {
    const payload = { id: '1', name: 'Test' };
    const result = ok(payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(payload);
    }
  });

  it('err wraps an AppError in a failure result', () => {
    const error = new NotFoundError('not found');
    const result = err(error);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(error);
      expect(result.error.statusCode).toBe(404);
    }
  });

  it('Result type narrows correctly with ok flag', () => {
    const result: Result<string> = ok('value');
    if (result.ok) {
      // TypeScript should know result.value is string here
      expect(typeof result.value).toBe('string');
    } else {
      // This branch unreachable for ok() but should compile
      expect(result.error).toBeInstanceOf(AppError);
    }
  });
});

describe('toHttpResponse', () => {
  it('returns the correct wire format', () => {
    const error = new NotFoundError('Goal not found');
    const response = toHttpResponse(error);
    expect(response).toEqual({ error: { code: 'NOT_FOUND', message: 'Goal not found' } });
  });

  it('works for all error subtypes', () => {
    const cases: AppError[] = [
      new UnauthorizedError('Unauthorized'),
      new ForbiddenError('Forbidden'),
      new ConflictError('Conflict'),
      new ValidationError('Bad input'),
      new InternalError('Crash'),
    ];
    for (const e of cases) {
      const response = toHttpResponse(e);
      expect(response.error.code).toBe(e.code);
      expect(response.error.message).toBe(e.message);
    }
  });
});
