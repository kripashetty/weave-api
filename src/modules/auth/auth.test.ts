// TODO: Implement auth module tests.
//
// Test cases to cover:
//
// AuthService.register
//   - creates user and family, returns token pair
//   - rejects duplicate email with a 409 AppError
//   - hashes password (bcrypt) — stored hash must not equal plain text
//
// AuthService.login
//   - returns token pair for valid credentials
//   - returns 401 for unknown email
//   - returns 401 for wrong password
//
// AuthService.refresh
//   - returns new access token and rotates refresh token
//   - returns 401 if refresh token not found in Redis
//   - detects stolen token: if same refresh token used twice, invalidates all family sessions
//
// AuthService.logout
//   - removes refresh token from Redis
//
// Route integration tests (using Fastify inject):
//   POST /auth/register  — 201 on success, 400 on schema violation
//   POST /auth/login     — 200 on success, 401 on bad credentials
//   POST /auth/refresh   — 200 on success, 401 on invalid token
//   POST /auth/logout    — 204 on success

import { describe, it } from 'vitest';

describe('AuthService', () => {
  // TODO: implement tests
});
