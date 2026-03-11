// TODO: Define Zod schemas for all goals request and response bodies.
//
// Schemas to define:
//   CreateGoalSchema      — { title, category, ownerId, targetDate?, requiresTimeBlock?, notes?, linkedExpenseId? }
//   UpdateGoalSchema      — Partial<CreateGoalSchema> (all fields optional)
//   GoalResponseSchema    — full Goal shape including latestCheckin
//   CreateCheckinSchema   — { status, note? }
//   CheckinResponseSchema — { id, goalId, userId, weekStart, status, note, checkedInAt }
//   GoalFiltersSchema     — { ownerId? } for query params
//
// GoalCategory enum values: PERSONAL_GROWTH | KIDS_DEVELOPMENT | FAMILY | HEALTH | FINANCIAL | OTHER
// CheckinStatus enum values: ON_TRACK | OFF_TRACK | BLOCKED | COMPLETED

import { z } from 'zod'

// TODO: implement schema definitions
export const CreateGoalSchema = z.object({})
export const UpdateGoalSchema = z.object({})
export const CreateCheckinSchema = z.object({})
