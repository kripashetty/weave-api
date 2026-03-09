// TODO: Implement the Insight Recalculation Worker (SQS consumer).
//
// Trigger: SQS message published after any data change:
//   - Expense created / updated / deactivated
//   - Goal created / updated / archived
//   - GoalCheckin created
//   - CALENDAR_SYNCED event
//
// Algorithm for the affected family:
//   1. Load all data needed by the rule set (goals, checkins, expenses, calendar events)
//   2. Run all V1 insight rules in sequence — each rule returns InsightSnapshot | null:
//
//      Rule 1 — unblocked_commitments
//        Query goals where requiresTimeBlock=true and archivedAt=null.
//        For each: check if any calendar event overlaps with the current week.
//        If not: surface/update the insight.
//
//      Rule 2 — goal_neglect
//        For each active goal: find most recent check-in.
//        If last check-in was 21+ days ago (or never): surface insight.
//
//      Rule 3 — category_spend_up
//        Compare current quarter's category totals vs prior quarter.
//        If any category is 20%+ higher: surface insight with metadata.
//
//      Rule 4 — subscription_renewals
//        Query active expenses where nextDueDate is within 14 days.
//        If any found: surface insight with upcoming renewal list.
//
//      Rule 5 — budget_pressure
//        Sum all active MONTHLY-equivalent expenses (normalise ANNUAL/QUARTERLY).
//        If total > 90% of family budget limit: surface WARNING insight.
//
//   3. For each rule: upsert result into insight_snapshots (@@unique prevents duplicates)
//   4. For resolved insights (condition no longer true): set resolvedAt = now()
//   5. Invalidate the Redis dashboard cache key for the family: del dashboard:<familyId>
//
// V2: extend to run TaxInsightRegistry rules when tax-related data changes.

export async function runInsightRecalc(_message: unknown): Promise<void> {
  // TODO: implement insight recalculation logic
}
