// TODO: Register Fastify routes for the insights module.
//
// Routes to implement:
//   GET   /insights          — list active (unresolved + undismissed) insights for the family
//   POST  /insights/:id/dismiss  — mark insight as dismissed (sets dismissedAt)
//
// Insights are pre-computed by the insight recalculation worker (insight-recalc.ts).
// This module is read-heavy — insights are served from the insight_snapshots table.
// No heavy computation at request time.
//
// The five V1 insight rules (implemented in shared/jobs/insight-recalc.ts):
//   1. unblocked_commitments   — goals with requiresTimeBlock=true but no calendar event
//   2. goal_neglect            — goals with no check-in in 21+ days
//   3. category_spend_up       — category spend up 20%+ vs same period last quarter
//   4. subscription_renewals   — subscriptions renewing in the next 14 days
//   5. budget_pressure         — total active expenses exceed 90% of a configurable limit

import type { FastifyInstance } from 'fastify'

export async function insightsRoutes(_app: FastifyInstance): Promise<void> {
  // TODO: implement route registrations
}
