// TODO (V2): Define Zod schemas for all tax request and response bodies.
//
// Schemas to define:
//   CreateTaxProfileSchema   — { jurisdiction, taxYear, filingStatus, householdIncomeBracket,
//                               isMarried, isSelfEmployed, hasRentalIncome, childrenCount,
//                               childrenDOB?, freistellungsauftrag?, pensionContribYTD?,
//                               propertyPurchaseDate? }
//   UpdateTaxProfileSchema   — Partial<CreateTaxProfileSchema>
//   TaxProfileResponse       — full TaxProfile shape
//   TaxDeadlineResponse      — { id, deadlineKey, title, description, dueDate, sourceUrl, dismissedAt? }
//   DismissDeadlineParams    — { id }
//
// GermanTaxClass enum: KLASSE_I | KLASSE_II | KLASSE_III | KLASSE_IV | KLASSE_V | KLASSE_VI
// IncomeBracket enum: UNDER_30K | BETWEEN_30K_60K | BETWEEN_60K_100K | BETWEEN_100K_200K | OVER_200K
//
// Note: freistellungsauftrag and pensionContribYTD serialised as strings (Decimal safety).

import { z } from 'zod';

// TODO (V2): implement schema definitions
export const CreateTaxProfileSchema = z.object({});
export const UpdateTaxProfileSchema = z.object({});
