// TODO: Register Fastify routes for the auth module.
//
// Routes to implement:
//   POST /auth/register  — create a new user and family (onboarding)
//   POST /auth/login     — validate credentials, return access + refresh tokens
//   POST /auth/refresh   — rotate refresh token, return new access token
//   POST /auth/logout    — invalidate refresh token in Redis
//
// All routes must have Zod-validated request schemas (from auth.schema.ts).
// Route handlers delegate to AuthService — no business logic here.
// Access token: 15-minute expiry, RS256. Refresh token: 30-day expiry, stored in Redis.
// Stolen token detection: if a refresh token is used twice, invalidate all family sessions.

import type { FastifyInstance } from 'fastify';

export async function authRoutes(_app: FastifyInstance): Promise<void> {
  // TODO: implement route registrations
}
