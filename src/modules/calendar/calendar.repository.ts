// TODO: Implement calendar database access layer.
//
// Responsibilities:
//   - findEvents(familyId, startDate, endDate): use @@index([familyId, startTime, endTime])
//     filter out soft-deleted events (deletedAt IS NULL)
//   - findAccounts(familyId): return CalendarAccounts with userId
//   - createAccount(data): create new CalendarAccount
//   - updateAccount(accountId, data): update lastSyncedAt, syncFailureCount etc.
//   - deleteAccount(familyId, accountId): hard delete CalendarAccount (cascades to events)
//   - upsertEvents(events): idempotent upsert — @@unique([calendarAccountId, externalId])
//     ensures sync is safe to re-run
//   - softDeleteEvents(calendarAccountId, externalIds): set deletedAt = now() for
//     events that no longer appear in the Google Calendar API response

export class CalendarRepository {
  // TODO: implement
}
