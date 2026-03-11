// TODO: Implement insights module tests.
//
// Test cases to cover — each insight rule is independently tested:
//
// Rule: unblocked_commitments
//   - surfaces insight when family has goals with requiresTimeBlock=true and no calendar event
//   - does not surface insight when calendar events cover the commitment
//
// Rule: goal_neglect
//   - surfaces WARNING when last check-in was 21+ days ago
//   - does not surface when check-in is within 21 days
//
// Rule: category_spend_up
//   - surfaces when a category is 20%+ higher than same period last quarter
//   - does not surface when spend is within threshold
//
// Rule: subscription_renewals
//   - surfaces when subscriptions have nextDueDate within 14 days
//
// InsightsService.dismissInsight
//   - sets dismissedAt
//   - re-surfaces after 7 days if condition still true (worker test)
//
// @@unique constraint test:
//   - upsert does not create duplicate insights for same ruleId when condition persists

import { describe } from 'vitest'

describe('InsightRules', () => {
  // TODO: implement tests
})
