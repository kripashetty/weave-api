// TODO (V2): Implement tax database access layer.
//
// Responsibilities:
//   - findTaxProfile(familyId): query tax_profiles — @unique on familyId
//   - createTaxProfile(data): insert new TaxProfile
//   - updateTaxProfile(familyId, data): update TaxProfile fields
//   - findDeadlines(taxProfileId, filters): query tax_deadlines ordered by dueDate
//     Use @@index([taxProfileId, dueDate]) for fast upcoming deadline queries
//   - dismissDeadline(taxProfileId, deadlineId): set dismissedAt = now()
//   - upsertDeadlines(rows): used by the tax-deadline-seeder job —
//     @@unique([taxProfileId, deadlineKey, taxYear]) makes this idempotent

export class TaxRepository {
  // TODO (V2): implement
}
