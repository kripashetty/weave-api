// TODO: Implement calendar business logic.
//
// Responsibilities:
//   - listEvents(familyId, startDate, endDate): query calendar_events within range
//     across all connected accounts for the family — exclude soft-deleted (deletedAt != null)
//   - listAccounts(familyId): return connected CalendarAccounts with lastSyncedAt status
//   - connectAccount(userId, familyId, code): exchange OAuth code for tokens,
//     encrypt the Google refresh token (AES-256), store on User.googleRefreshTokenEnc,
//     create CalendarAccount record, trigger first sync via SQS
//   - disconnectAccount(familyId, accountId): remove CalendarAccount, nullify user's
//     googleRefreshTokenEnc
//   - triggerSync(familyId): enqueue SQS CALENDAR_SYNC_REQUESTED message
//
// Google OAuth token encryption: AES-256-GCM using APP_SECRET from config.
// If syncFailureCount > 3, the insight engine surfaces a "reconnect calendar" alert.
// Returns Result<T, AppError> — never throws.

export class CalendarService {
  // TODO: implement
}
