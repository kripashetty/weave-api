// TODO: Define Zod schemas for all insights request and response bodies.
//
// Schemas to define:
//   InsightResponseSchema  — { id, ruleId, message, severity, metadata?, generatedAt,
//                             dismissedAt?, resolvedAt? }
//   DismissParamsSchema    — { id } (insightId path param)
//
// InsightSeverity enum values: INFO | WARNING | CRITICAL
//
// metadata shape varies by ruleId — document per rule when implementing:
//   unblocked_commitments: { goalIds: string[], count: number }
//   goal_neglect:          { goalId: string, goalTitle: string, daysSinceCheckin: number }
//   category_spend_up:     { category: string, changePercent: number, currentAmount: string }
//   subscription_renewals: { expenseIds: string[], totalAmount: string, earliestDueDate: string }
//   budget_pressure:       { totalMonthly: string, limit: string, utilisationPercent: number }

import { z } from 'zod';

// TODO: implement schema definitions
export const DismissParamsSchema = z.object({});
