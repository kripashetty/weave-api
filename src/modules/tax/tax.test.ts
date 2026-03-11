// TODO (V2): Implement tax module tests.
//
// Test cases to cover (V2 implementation):
//
// TaxService.createTaxProfile
//   - creates profile for a family
//   - rejects if a profile already exists for the family
//
// TaxInsightRegistry (see ADR-10):
//   - getRulesForJurisdiction('DE', 2025) returns all German 2025 rules
//   - rules for a different jurisdiction/year are not returned
//
// German 2025 tax insight rules (each tested independently):
//   - de_kindergeld_tracker: surfaces when childrenCount > 0 and claim not confirmed
//   - de_riester_allowance: calculates correct allowance for given childrenDOB[]
//   - de_freistellungsauftrag: surfaces when freistellungsauftrag < (1000 * adults)
//   - de_homeoffice_pauschale: cross-references calendar home office days
//   - de_ruerup_deduction: surfaces for self-employed with no PENSION expenses
//
// TaxDeadlineSeeder job:
//   - seeds correct 2025 DE deadlines for a family with jurisdiction='DE'
//   - is idempotent — running twice does not create duplicates

import { describe } from 'vitest'

describe('TaxService', () => {
  // TODO (V2): implement tests
})
