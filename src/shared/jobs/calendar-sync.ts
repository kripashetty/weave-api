// TODO: Implement the Calendar Sync Worker (SQS consumer).
//
// Trigger: SQS message enqueued by EventBridge every 15 minutes (or on-demand via
//          POST /calendar/sync route)
//
// Algorithm for each connected CalendarAccount:
//   1. Load the user's encrypted Google refresh token from User.googleRefreshTokenEnc
//   2. Decrypt using AES-256-GCM (APP_SECRET from config)
//   3. Exchange refresh token for a new Google access token (OAuth2)
//   4. Fetch events from Google Calendar API for the account
//      — use incremental sync (syncToken) where possible for efficiency
//      — fall back to full sync if syncToken is expired
//   5. Upsert events into calendar_events using CalendarRepository.upsertEvents
//      — @@unique([calendarAccountId, externalId]) makes this idempotent
//   6. Soft-delete events that no longer appear in the response (set deletedAt)
//   7. Update CalendarAccount.lastSyncedAt = now(), reset syncFailureCount = 0
//
// On any error:
//   - Increment CalendarAccount.syncFailureCount
//   - If syncFailureCount > 3, do NOT throw — the insight engine will surface
//     a "reconnect your calendar" alert automatically
//   - Log the error with context (accountId, userId)
//
// On success: publish CALENDAR_SYNCED SQS event → triggers insight recalculation

export async function runCalendarSync(_message: unknown): Promise<void> {
  // TODO: implement calendar sync logic
}
