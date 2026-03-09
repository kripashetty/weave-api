// TODO: Implement insights database access layer.
//
// Responsibilities:
//   - findActiveInsights(familyId): query insight_snapshots where resolvedAt IS NULL
//     AND (dismissedAt IS NULL OR dismissedAt < now() - 7 days)
//     Uses @@index([familyId, resolvedAt, dismissedAt])
//   - dismissInsight(familyId, insightId): set dismissedAt = now()
//   - upsertInsight(data): used by the insight worker — @@unique([familyId, ruleId, resolvedAt])
//     prevents duplicate active insights for the same rule
//   - resolveInsight(familyId, ruleId): set resolvedAt = now() when the condition clears

export class InsightsRepository {
  // TODO: implement
}
