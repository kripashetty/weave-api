// TODO: Implement insights business logic.
//
// Responsibilities:
//   - listInsights(familyId): return active insights — resolvedAt IS NULL AND dismissedAt IS NULL.
//     Use @@index([familyId, resolvedAt, dismissedAt]).
//   - dismissInsight(familyId, insightId): set dismissedAt = now()
//     Dismissed insights re-surface after 7 days if the underlying condition is still true
//     (handled by the insight recalculation worker).
//
// Note: insight creation and resolution is handled by the insight-recalc worker,
// not by this service. This service is the read + user-action layer only.
//
// Returns Result<T, AppError> — never throws.

export class InsightsService {
  // TODO: implement
}
