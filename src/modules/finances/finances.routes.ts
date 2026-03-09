// TODO: Register Fastify routes for the finances module.
//
// Routes to implement:
//   GET    /finances/expenses         — list active expenses for the family
//   POST   /finances/expenses         — log a new expense (manual or Excel import batch)
//   GET    /finances/expenses/:id     — get single expense with event history
//   PATCH  /finances/expenses/:id     — update expense (writes Expense + ExpenseEvent in one transaction)
//   DELETE /finances/expenses/:id     — soft-delete (sets isActive = false, writes DEACTIVATED event)
//   GET    /finances/summary          — monthly/quarterly category aggregations
//   POST   /finances/import           — bulk upsert from Excel (client parsed — receives structured JSON)
//   GET    /finances/tradeoff         — given a proposed new expense, show impact on budget
//
// IMPORTANT: Every write to Expense must produce an ExpenseEvent in the same DB transaction.
// Amounts use Decimal — never serialise as raw Decimal.js objects (use .toNumber() or .toString()).

import type { FastifyInstance } from 'fastify';

export async function financesRoutes(_app: FastifyInstance): Promise<void> {
  // TODO: implement route registrations
}
