// TODO (V2): Implement tax business logic.
//
// Responsibilities:
//   - getTaxProfile(familyId): return TaxProfile with upcoming deadlines
//   - createTaxProfile(familyId, dto): create — enforces one profile per family (@unique)
//   - updateTaxProfile(familyId, dto): update profile, publish SQS event to trigger
//     TAX_INSIGHT_RECALC for the affected family
//   - listDeadlines(familyId): return upcoming TaxDeadlines ordered by dueDate
//     (exclude dismissed unless ?includeDismissed=true)
//   - dismissDeadline(familyId, deadlineId): set dismissedAt = now()
//
// Tax insight recalculation is triggered by:
//   - TaxProfile updated
//   - Expense in INVESTMENT / PROPERTY / PENSION category added
//   - Calendar synced (for Homeoffice-Pauschale day count)
//   - 1 January (new tax year — via tax-deadline-seeder job)
//
// See ADR-10 for the TaxInsightRegistry pattern used by the insight worker.
// Returns Result<T, AppError> — never throws.

export class TaxService {
  // TODO (V2): implement
}
