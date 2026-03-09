// TODO: Implement the JWT authentication middleware (Fastify preHandler hook).
//
// Responsibilities:
//   - Extract the Bearer token from the Authorization header
//   - Verify the token signature using the RS256 public key from config
//   - Validate expiry — return 401 if expired
//   - Decode the payload: { sub, familyId, role, iat, exp }
//   - Attach the decoded payload to request.user
//   - Return 401 with a consistent error shape if anything fails
//
// JWT payload interface (for reference):
//   interface JWTPayload {
//     sub: string        // user_id
//     familyId: string   // tenant identifier
//     role: 'ADMIN' | 'MEMBER'
//     iat: number
//     exp: number
//   }
//
// This hook is registered on protected routes only — not on /auth/* routes.
// Token signing uses RS256 (asymmetric). Public key is loaded from config at startup.
// Never log the full token — log only the sub claim if needed for debugging.

import type { FastifyReply, FastifyRequest } from 'fastify';

export async function authenticate(
  _request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  // TODO: implement JWT verification
}
