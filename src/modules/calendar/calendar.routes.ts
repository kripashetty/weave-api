// TODO: Register Fastify routes for the calendar module.
//
// Routes to implement:
//   GET  /calendar/events            — list events for a date range (both partners' calendars)
//   GET  /calendar/accounts          — list connected Google Calendar accounts for the family
//   POST /calendar/accounts/connect  — initiate Google OAuth flow (returns OAuth URL)
//   GET  /calendar/accounts/callback — OAuth callback handler — exchange code for tokens,
//                                      store encrypted refresh token on User, trigger first sync
//   DELETE /calendar/accounts/:id    — disconnect a calendar account
//   POST /calendar/sync              — manually trigger a sync (enqueues SQS message)
//
// V1 is READ-ONLY — no write-back to Google Calendar.
// Calendar data is served from the local cache (calendar_events table) — ADR-03.
// familyId is denormalised on CalendarEvent for fast family-scoped range queries.

import type { FastifyInstance } from 'fastify'

export async function calendarRoutes(_app: FastifyInstance): Promise<void> {
  // TODO: implement route registrations
}
