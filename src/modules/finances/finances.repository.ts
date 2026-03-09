// TODO: Implement finances database access layer.
//
// Responsibilities:
//   - findExpenses(familyId, filters): query expenses — scoped to familyId + isActive
//   - findExpenseById(familyId, expenseId): single expense with events
//   - createExpenseWithEvent(data): Prisma interactive transaction — Expense + ExpenseEvent
//   - updateExpenseWithEvent(familyId, expenseId, data): transaction — update + UPDATED event
//   - deactivateExpenseWithEvent(familyId, expenseId): transaction — isActive=false + DEACTIVATED event
//   - upsertExpenses(familyId, rows): idempotent bulk upsert for Excel import
//   - aggregateByCategory(familyId, startDate, endDate): used by summary endpoints
//     Prefer Prisma $queryRaw for this aggregation — the group-by query is cleaner in SQL
//
// Rule: ExpenseEvent rows are NEVER updated or deleted — append only.

export class FinancesRepository {
  // TODO: implement
}
