// TODO (V2): Register Fastify routes for the tax module.
//
// Routes to implement in V2:
//   GET   /tax/profile             — get the family's TaxProfile
//   POST  /tax/profile             — create TaxProfile (one per family)
//   PATCH /tax/profile             — update TaxProfile fields (triggers tax insight recalc)
//   GET   /tax/deadlines           — list upcoming tax deadlines for the family's jurisdiction
//   POST  /tax/deadlines/:id/dismiss — dismiss a completed deadline
//   GET   /tax/insights            — list active tax insights (subset of /insights filtered by tax rules)
//
// Tax module is jurisdiction-aware — rules are scoped to TaxProfile.jurisdiction.
// All insights link to official sources and carry a disclaimer (see ADR-10).
// This module is V2 scope — schema exists but routes are not implemented in V1.

import type { FastifyInstance } from 'fastify';

export async function taxRoutes(_app: FastifyInstance): Promise<void> {
  // TODO (V2): implement route registrations
}
