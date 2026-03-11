// TODO: Define Zod schemas for all finances request and response bodies.
//
// Schemas to define:
//   CreateExpenseSchema      — { name, amount, currency?, category, recurrence, nextDueDate?, linkedGoalId?, source? }
//   UpdateExpenseSchema      — Partial<CreateExpenseSchema>
//   ExpenseResponseSchema    — full Expense shape (amount as string for Decimal safety)
//   BulkImportSchema         — { rows: CreateExpenseSchema[] }
//   SummaryQuerySchema       — { month?, quarter?, year } (query params)
//   TradeoffQuerySchema      — { amount, category, recurrence } (query params)
//
// ExpenseCategory enum values: KIDS_ACTIVITIES | PERSONAL_GROWTH | HOUSEHOLD | SAVINGS |
//   ENTERTAINMENT | SUBSCRIPTIONS | INVESTMENT | PROPERTY | PENSION | OTHER
// Recurrence enum values: WEEKLY | MONTHLY | QUARTERLY | ANNUAL | ONE_OFF
//
// NOTE: amount must be serialised as a string in responses — never as a float.

import { z } from 'zod'

// TODO: implement schema definitions
export const CreateExpenseSchema = z.object({})
export const UpdateExpenseSchema = z.object({})
export const BulkImportSchema = z.object({})
