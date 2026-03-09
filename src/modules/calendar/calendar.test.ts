// TODO: Implement calendar module tests.
//
// Test cases to cover:
//
// CalendarService.listEvents
//   - returns events within date range for all family accounts
//   - excludes soft-deleted events (deletedAt != null)
//
// CalendarService.connectAccount
//   - stores encrypted Google refresh token on User
//   - creates CalendarAccount with syncFailureCount = 0
//   - enqueues first sync SQS message
//
// CalendarService.disconnectAccount
//   - removes CalendarAccount
//   - nullifies googleRefreshTokenEnc on User
//
// CalendarRepository.upsertEvents
//   - idempotent: running upsert twice with same externalId does not create duplicates
//
// SyncFailureCount behaviour:
//   - after 3 consecutive failures, syncFailureCount > 3 (tested at service layer)

import { describe, it } from 'vitest';

describe('CalendarService', () => {
  // TODO: implement tests
});
