// TODO: Implement the Weekly Digest Worker (SQS consumer).
//
// Trigger: SQS message enqueued by EventBridge every Sunday at 18:00 family local time
//
// Algorithm for each family with at least one active user:
//   1. Aggregate the past week's data:
//      - Goal check-in summary: how many goals checked in, any blocked/off-track
//      - Upcoming week's calendar events (next 7 days) across all family accounts
//      - Any active insights (unresolved + undismissed)
//      - Expense categories with notable changes vs prior week
//   2. Render an HTML email template with the above data
//   3. Send via AWS SES to all ADMIN users in the family
//      (MEMBER users: opt-in TBD — V1 sends to ADMINs only)
//
// Email content (from PRODUCT_BRIEF.md insight engine):
//   - "3 commitments have no time blocked this week"
//   - "Kids' activity spend is up 40% this quarter"
//   - "You haven't checked in on [goal] in 3 weeks"
//   - Upcoming week preview: events from both partners' calendars
//
// SES_FROM_EMAIL is set in config (validated on startup).
// Never include raw financial amounts in email subject lines.

export async function runWeeklyDigest(_message: unknown): Promise<void> {
  // TODO: implement weekly digest logic
}
