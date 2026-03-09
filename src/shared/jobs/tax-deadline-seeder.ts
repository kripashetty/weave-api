// TODO (V2): Implement the Tax Deadline Seeder Worker (SQS consumer).
//
// Trigger: SQS message enqueued by EventBridge on 1 January each year
//
// Algorithm:
//   1. Query all TaxProfiles
//   2. For each TaxProfile: look up the jurisdiction's deadlines for the new tax year
//      from the hardcoded deadline registry (DeadlineRegistry.getDeadlines(jurisdiction, year))
//   3. Upsert deadlines into tax_deadlines using @@unique([taxProfileId, deadlineKey, taxYear])
//      — idempotent: safe to re-run if the job fails and is retried
//   4. Log: "Seeded N deadlines for jurisdiction X, tax year Y"
//
// Hardcoded deadline registry for Germany 2025 (from PRODUCT_BRIEF.md):
//   - 31 July 2025    — Steuererklärung 2024 due (ELSTER)
//   - 31 December 2024 — Last day for Riester/Rürup contributions (2024 tax year)
//   - 15 January 2025 — Review Freistellungsauftrag allocations for 2025
//   - Quarterly       — Vorauszahlungen reminders (self-employed families only)
//
// Source: manually maintained, updated annually as tax law changes.
// V3: replace with a tax rules API if one becomes available.
//
// IMPORTANT: sourceUrl must be populated for every deadline — always links to official source.

export async function runTaxDeadlineSeeder(_message: unknown): Promise<void> {
  // TODO (V2): implement tax deadline seeding logic
}
