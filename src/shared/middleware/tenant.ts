// TODO: Implement the tenant middleware (Fastify preHandler hook, runs after authenticate).
//
// Responsibilities:
//   - Read familyId from request.user (set by authenticate middleware)
//   - Set the PostgreSQL session variable for RLS: SET LOCAL app.family_id = '<familyId>'
//     This enforces tenant isolation at the database layer (ADR-07)
//   - The SET LOCAL is scoped to the current transaction — safe with connection pooling
//     because it resets when the connection is returned to the pool
//
// RLS policy reference (from ADR-07):
//   CREATE POLICY family_isolation ON goals
//     USING (family_id = current_setting('app.family_id')::uuid);
//
// Implementation pattern:
//   await prisma.$executeRaw`SET LOCAL app.family_id = ${familyId}`
//
// This middleware must run on every request that touches the database.
// Order: authenticate → tenant → route handler.

import type { FastifyReply, FastifyRequest } from 'fastify';

export async function injectTenant(
  _request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  // TODO: implement RLS session variable injection
}
