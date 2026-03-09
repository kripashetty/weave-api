// TODO: Register Fastify routes for the goals module.
//
// Routes to implement:
//   GET    /goals               — list active goals for the family (filter by ownerId optional)
//   POST   /goals               — create a new goal
//   GET    /goals/:id           — get a single goal with check-in history
//   PATCH  /goals/:id           — update goal fields
//   DELETE /goals/:id           — soft-delete (sets archivedAt)
//   POST   /goals/:id/checkins  — submit a weekly check-in (one per goal per week)
//   GET    /goals/:id/checkins  — list check-in history for a goal
//
// All routes require authentication. familyId injected via tenant middleware.
// weekStart must be normalised to Monday 00:00:00 UTC in the service layer.

import type { FastifyInstance } from 'fastify';

export async function goalsRoutes(_app: FastifyInstance): Promise<void> {
  // TODO: implement route registrations
}
