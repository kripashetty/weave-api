// TODO: Implement finances module tests.
//
// Test cases to cover:
//
// FinancesService.createExpense
//   - creates Expense and CREATED ExpenseEvent in one transaction
//   - serialises amount as string (not float) in response
//
// FinancesService.updateExpense
//   - creates UPDATED event alongside update — does not modify existing events
//
// FinancesService.deactivateExpense
//   - sets isActive = false, creates DEACTIVATED event
//   - active expense query no longer returns the deactivated expense
//
// FinancesService.getMonthlySummary
//   - returns correct category totals for a given month
//
// FinancesService.getTradeoffView
//   - returns correct budget impact including the proposed expense
//
// Decimal precision tests:
//   - arithmetic on amounts uses Decimal.js — no floating point rounding errors
//   - £9.99 * 12 = £119.88 exactly

import { describe, it } from 'vitest';

describe('FinancesService', () => {
  // TODO: implement tests
});
