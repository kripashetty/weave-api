// TODO: Register Fastify routes for the family module.
//
// Routes to implement:
//   GET  /family          — get the current family details (members, settings)
//   PATCH /family         — update family name (ADMIN only)
//   POST /family/invite   — invite a new member by email (ADMIN only)
//   DELETE /family/members/:userId — remove a member (ADMIN only)
//
// All routes require authentication (authenticate middleware).
// All routes inject familyId from JWT via the tenant middleware.
// ADMIN-only routes must enforce role check.

import type { FastifyInstance } from 'fastify';

export async function familyRoutes(_app: FastifyInstance): Promise<void> {
  // TODO: implement route registrations
}
