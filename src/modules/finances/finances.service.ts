// TODO: Implement finances business logic.
//
// Responsibilities:
//   - listExpenses(familyId, filters): return active expenses — use @@index([familyId, isActive])
//   - createExpense(familyId, dto): write Expense + ExpenseEvent(CREATED) in one transaction
//   - updateExpense(familyId, expenseId, dto): write Expense update + ExpenseEvent(UPDATED)
//     in one transaction — never update ExpenseEvent rows (append-only)
//   - deactivateExpense(familyId, expenseId): set isActive=false + ExpenseEvent(DEACTIVATED)
//     in one transaction
//   - bulkImportExpenses(familyId, rows): idempotent upsert from Excel — use ExpenseSource.EXCEL_IMPORT
//   - getMonthlySummary(familyId, month): aggregate by category for a given month
//   - getQuarterlySummary(familyId, quarter, year): aggregate by category for a quarter
//   - getTradeoffView(familyId, proposedExpense): calculate budget impact of adding a new expense
//
// ADR-08: All monetary arithmetic must use Decimal.js — never native +/-/* on amounts.
// Publishes SQS event after any write to trigger insight recalculation.
// Returns Result<T, AppError> — never throws.

export class FinancesService {
  // TODO: implement
}
