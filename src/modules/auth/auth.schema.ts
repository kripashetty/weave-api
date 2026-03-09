// TODO: Define Zod schemas for all auth request and response bodies.
//
// Schemas to define:
//   RegisterRequestSchema  — { name, email, password, familyName }
//   RegisterResponseSchema — { accessToken, refreshToken, user: { id, name, email, role } }
//   LoginRequestSchema     — { email, password }
//   LoginResponseSchema    — { accessToken, refreshToken, user: { id, name, email, role } }
//   RefreshRequestSchema   — { refreshToken }
//   RefreshResponseSchema  — { accessToken }
//   LogoutRequestSchema    — (empty body; userId from JWT)
//
// JWT payload shape (for reference — typed in shared/utils/jwt.ts):
//   { sub: string, familyId: string, role: 'ADMIN' | 'MEMBER', iat: number, exp: number }
//
// All schemas are used in both route validation and TypeScript type inference.

import { z } from 'zod';

// TODO: implement schema definitions
export const RegisterRequestSchema = z.object({});
export const LoginRequestSchema = z.object({});
export const RefreshRequestSchema = z.object({});
