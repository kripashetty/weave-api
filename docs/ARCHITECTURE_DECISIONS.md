# Weave — Architecture Decision Records

ADRs document every significant technical decision: what was decided, why, what
alternatives were considered, and what the consequences are. They are written at
the time of the decision and never deleted — only superseded by a new ADR.

**Status types:** `accepted` | `superseded` | `deprecated` | `proposed`

---

## ADR-01: Modular Monolith Over Microservices

**Date:** 2026-03-09
**Status:** accepted

### Decision
Build weave-api as a single deployable service with clearly bounded internal
modules (auth, goals, finances, calendar, insights) rather than separate
microservices.

### Context
Weave is a new product with one developer and an unproven architecture. The
system needs to be deployable, debuggable, and changeable quickly. The domain
boundaries are understood at a high level but will likely shift as we learn from
real usage.

### Alternatives Considered

**Microservices from day one**
Each module (auth, goals, finances, calendar, insights) as a separate deployed
service with its own database. Pros: independent deployability, technology
flexibility per service, clear ownership boundaries. Cons: massive operational
overhead (service discovery, distributed tracing, network failures between
services, multiple CI/CD pipelines), premature boundary solidification before we
understand the domain well, and complexity that slows down a single developer
significantly.

**Serverless functions (AWS Lambda)**
Each API endpoint as a Lambda function. Pros: zero server management, scales to
zero cost when idle. Cons: cold start latency on a dashboard app is unacceptable,
local development is painful, connection pooling to PostgreSQL is problematic
without an intermediary like RDS Proxy, and testing is more complex.

### Decision Rationale
A modular monolith gives the benefits of clear code boundaries without the
operational overhead of distribution. Module boundaries are enforced by code
convention (no cross-module repository calls, only cross-module service calls)
rather than network boundaries. If a module boundary turns out to be wrong, it
costs a refactor — not a redeployment strategy and inter-service contract
renegotiation.

The monolith can be extracted into services later if genuine scaling or team
ownership reasons emerge. That is a known, well-understood migration path.
Starting with microservices and consolidating is much harder.

### Consequences
- Single Docker image to build, test, and deploy
- All modules share the same database connection pool
- A bug in one module can theoretically affect others — mitigated by module
  isolation conventions and test coverage
- Scaling is coarse-grained (scale the whole API) — acceptable at portfolio scale
  and early product stage
- If weave-api grows to require separate scaling of the calendar sync worker vs
  the API, the workers are already separated into a different process (SQS
  consumers) — this is the natural first extraction point

### Migration Trigger
If any of these become true, revisit this decision:
- The insights engine requires significantly more compute than the API
- A second engineering team needs to own a module independently
- A module needs a different technology (e.g. Python for ML)

---

## ADR-02: Two Separate Repos Over Monorepo

**Date:** 2026-03-09
**Status:** accepted

### Decision
Maintain weave-web and weave-api as two separate GitHub repositories rather than
a monorepo managed by Turborepo or Nx.

### Context
The frontend (Next.js) and backend (Fastify) are separate deployable units with
different deployment targets, different CI/CD pipelines, and different dependency
lifecycles. The shared surface area between them is limited to TypeScript type
definitions.

### Alternatives Considered

**Turborepo monorepo**
Both apps in one repo with a packages/types shared package. Pros: single place
for all code, shared types without publishing, atomic commits across frontend and
backend, shared ESLint and TypeScript config. Cons: Turborepo adds tooling
complexity and a learning curve; the shared surface area (just types) doesn't
justify it; the repo becomes harder to navigate for someone reviewing the
portfolio.

**Nx monorepo**
Enterprise-grade monorepo tooling. Pros: very powerful, used widely in large
organisations. Cons: significant setup overhead, steep learning curve, heavy
tooling for a two-app project.

### Decision Rationale
The only genuine shared concern between the two repos is TypeScript type
definitions. This is solved cleanly by publishing a small private `@weave/types`
package to GitHub Packages — a 20-minute setup that is itself a portfolio
artifact (demonstrates understanding of package publishing and private npm
registries).

Two clean repos are easier to clone, review, and understand independently. An
interviewer looking at the portfolio can focus on the backend architecture without
navigating frontend code, and vice versa.

### Consequences
- Shared types require a publish step when changed — small friction but
  manageable with a GitHub Action that auto-publishes on changes to the types
  package
- Two CI/CD pipelines to maintain — acceptable and each is simpler for being
  independent
- Cross-cutting changes (e.g. adding a new API endpoint and its frontend
  consumer) require two PRs — this is a genuine cost and acceptable at this
  team size

### Migration Trigger
If a mobile app (React Native) is added in V2, the shared type surface area grows
significantly and the monorepo tradeoff shifts. Reassess at that point.

---

## ADR-03: Local Calendar Cache Over Live Google Calendar API Calls

**Date:** 2026-03-09
**Status:** accepted

### Decision
Sync Google Calendar events into a local `calendar_events` table every 15 minutes
via a background worker, and serve the calendar view from the local cache rather
than calling the Google Calendar API on each page request.

### Context
The calendar view is loaded on every dashboard visit. It needs to show events from
both partners' calendars. The insight engine also needs calendar data to run
conflict detection rules. Both of these require fast, reliable access to calendar
data.

### Alternatives Considered

**Live API calls on every request**
Call Google Calendar API directly when the calendar view is loaded. Pros:
always up to date, no sync lag, simpler code (no background job). Cons: Google
Calendar API has rate limits (10 requests/second per user); latency is added to
every page load; if Google's API is down, the calendar view is completely broken;
two API calls per load (one per partner's calendar) compound the problem.

**User-triggered refresh**
Only sync when the user explicitly clicks a "refresh" button. Pros: no background
job complexity, no rate limit risk. Cons: data is stale by default, poor UX, the
insight engine can't run on fresh data automatically.

### Decision Rationale
The calendar view is a read-heavy, latency-sensitive UI component. Serving it from
a local PostgreSQL query (with an index on familyId + startTime) is an order of
magnitude faster than an external API call. The 15-minute sync lag is acceptable
for a weekly planning tool — users are not looking at real-time calendar updates,
they are reviewing their week.

Decoupling the insight engine from live API calls means insights can be
recalculated reliably without worrying about API rate limits or availability.

The sync worker uses an idempotent upsert pattern
(@@unique([calendarAccountId, externalId])) — safe to run multiple times without
creating duplicates.

### Consequences
- Calendar data can be up to 15 minutes stale — acceptable for this use case,
  documented in the UI with a "last synced" timestamp
- Background worker must handle Google OAuth token refresh transparently
- If a user's Google account is disconnected, `syncFailureCount` increments and
  an insight is surfaced after 3 failures prompting reconnection
- Deleted Google Calendar events are soft-deleted in local cache (deletedAt) on
  next sync — not immediately visible to the user

### Migration Trigger
If V2 introduces calendar write-back, the sync strategy needs to become
bidirectional with conflict resolution. A new ADR will be written at that point.

---

## ADR-04: Rule-Based Insight Engine Over AI/ML

**Date:** 2026-03-09
**Status:** accepted

### Decision
Implement the insight engine as a set of deterministic, rule-based functions
rather than using an LLM or ML model to generate insights.

### Context
The insight engine is the connective tissue of Weave — it surfaces actionable
observations by joining data across goals, expenses, and calendar events. The
quality and trustworthiness of insights directly affects whether users act on them,
especially for financial decisions.

### Alternatives Considered

**LLM-generated insights (e.g. Claude, GPT-4)**
Prompt an LLM with the family's data and ask it to generate personalised insights.
Pros: can surface nuanced patterns, natural language output, handles edge cases
without explicit rules. Cons: non-deterministic (same data produces different
insights on different runs), expensive at scale, hard to test, users cannot
understand why a specific insight was generated, financial suggestions from an
ungrounded LLM are a trust liability, latency is high.

**ML anomaly detection**
Train a model on spending patterns to detect anomalies. Pros: can learn
user-specific baselines. Cons: requires significant historical data to train,
overkill for the insights we need, introduces a model training and serving
infrastructure concern.

### Decision Rationale
The insights Weave needs in V1 are all deterministic questions with clear answers:
- Does this goal have a calendar block? (yes/no)
- Has there been a check-in in the last 21 days? (yes/no)
- Is category spend up vs last quarter? (calculate and compare)
- Are there subscriptions renewing this month? (filter by nextDueDate)

None of these require ML. They require correct SQL queries and clear thresholds.
Rule-based insights are testable (each rule has a unit test), explainable (the
user can see exactly why the insight was generated via the metadata field),
deterministic (same data always produces the same insight), and free.

AI-generated insights are planned for V3 — after rule-based insights have been
validated with real users and the baseline quality bar is established. The
AI layer will supplement rules, not replace them.

### Consequences
- Each insight rule is an independent, testable function — easy to add, modify,
  or disable without affecting others
- Insight messages are templated strings filled with real data — always accurate,
  never hallucinated
- Adding a new insight type requires writing a new rule function and its test —
  slightly more work than prompting an LLM, but far more reliable
- The `metadata` field on InsightSnapshot stores the rule-specific context needed
  to render rich insight cards and deep-link to the relevant module

### Migration Trigger
V3: add an AI layer that runs after rule-based insights and can surface patterns
too complex to hardcode. AI insights will be clearly labelled as "suggestions"
rather than "alerts" to communicate the difference in confidence level.

---

## ADR-05: Client-Side Excel Parsing Over Server-Side

**Date:** 2026-03-09
**Status:** accepted

### Decision
Parse uploaded Excel files in the browser using SheetJS before sending data to
the API, rather than uploading the raw file to the server for processing.

### Context
Users want to import their existing household expense spreadsheets into Weave
without re-entering data manually. The spreadsheets contain sensitive financial
information. The column structure varies between users.

### Alternatives Considered

**Server-side parsing**
Upload the raw Excel file to S3, process it with a Lambda function or background
job, return the parsed results. Pros: consistent parsing environment, can handle
large files, easier to retry on failure. Cons: raw financial data transits to and
is stored on the server even temporarily, requires S3 and Lambda infrastructure,
slower feedback loop for the user (async processing).

**CSV export requirement**
Ask users to export their spreadsheet as CSV before uploading. Pros: simpler
parsing, universal format. Cons: adds friction to the user journey, many users
won't know how to export CSV from Excel.

### Decision Rationale
Client-side parsing with SheetJS keeps raw financial data on the user's device.
The server only ever receives validated, structured JSON — never the raw file.
This is a meaningful privacy improvement and reduces attack surface.

The user experience is better: parsing happens instantly in the browser, the
column mapping UI appears immediately, and the user can correct mappings before
any data is sent. No async processing wait, no email notification when import
completes.

SheetJS handles .xlsx, .xls, and .csv — users can upload whatever format they
have without extra steps.

### Consequences
- Large files (10,000+ rows) may cause browser performance issues — acceptable
  since household expense sheets are typically under 500 rows
- Parsing logic runs in the browser — cannot be patched server-side if SheetJS
  has a vulnerability; must update the frontend dependency
- The column mapping step (matching user's column headers to our schema fields)
  must be handled in the frontend — adds UI complexity but significantly improves
  correctness for varied spreadsheet formats

---

## ADR-06: Prisma Over Raw SQL

**Date:** 2026-03-09
**Status:** accepted

### Decision
Use Prisma ORM for all database access rather than raw SQL queries or a lighter
query builder like Knex.

### Context
The application needs a PostgreSQL client with TypeScript type safety, migration
management, and a developer-friendly query API. The team is one person working
across both frontend and backend.

### Alternatives Considered

**Raw SQL with node-postgres (pg)**
Write SQL directly. Pros: full control, no abstraction overhead, best performance,
teaches SQL deeply. Cons: no type safety without manual type definitions, no
migration tooling built in, boilerplate for parameterised queries, harder to
refactor when schema changes.

**Knex.js**
SQL query builder with TypeScript support. Pros: thin abstraction, close to raw
SQL, flexible. Cons: no schema-first type generation, migration tooling is more
manual than Prisma, less ecosystem momentum in 2025/2026.

**Drizzle ORM**
Newer, TypeScript-native ORM with SQL-like syntax. Pros: very type-safe, better
performance than Prisma in some benchmarks, growing adoption. Cons: smaller
ecosystem, fewer resources, less battle-tested. Worth reconsidering in V2.

### Decision Rationale
Prisma generates TypeScript types directly from the schema. When the schema
changes, the types update after `prisma generate` — the compiler catches
everywhere the code needs to update. This is the primary reason for the choice:
schema and types are never out of sync.

Prisma Migrate provides deterministic, version-controlled migrations that run as
part of the deployment pipeline. Schema changes are tracked, reviewable, and
reversible.

Prisma is the most widely used ORM in the Node.js/TypeScript ecosystem and appears
frequently in job descriptions and codebases. Familiarity with it is directly
transferable.

For complex analytical queries (e.g. quarterly category aggregations in the
insight engine), Prisma's `$queryRaw` allows dropping to raw SQL where the query
builder would be cumbersome — the best of both worlds.

### Consequences
- Prisma Client adds ~50ms to cold start — acceptable on ECS Fargate, would be a
  concern on Lambda (another reason Lambda was not chosen for the API)
- The Prisma schema is the single source of truth for the database structure —
  never modify the database directly
- N+1 query problems are possible if relations are not loaded with `include` —
  mitigated by reviewing Prisma's query logs in development
- Prisma does not support all PostgreSQL features natively (e.g. partial indexes,
  some advanced constraints) — use `prisma migrate dev --create-only` to write
  raw SQL migrations where needed

---

## ADR-07: Row-Level Security at the Database Layer for Tenant Isolation

**Date:** 2026-03-09
**Status:** accepted

### Decision
Enforce family (tenant) data isolation using PostgreSQL Row-Level Security (RLS)
policies in addition to application-layer filtering, rather than relying on
application-layer filtering alone.

### Context
Weave is a multi-tenant application. Each family's data must be completely
invisible to other families. A bug in the application layer (e.g. a missing
`WHERE familyId = ?` clause) must not result in data leakage between tenants.

### Alternatives Considered

**Application-layer filtering only**
Every query includes a `WHERE family_id = ?` clause. The middleware injects
`familyId` from the JWT and the repository layer always filters by it. Pros:
simpler, works with any database. Cons: a single missed filter clause leaks all
data. Defence in depth is not present — the application is the only line of
defence.

**Separate database per tenant**
Each family gets its own PostgreSQL database or schema. Pros: strongest possible
isolation, no RLS complexity. Cons: impractical at scale (connection pooling
becomes very complex), schema migrations must run N times (once per tenant),
operational overhead is enormous.

**Separate schema per tenant**
Each family gets its own PostgreSQL schema (not database). Pros: strong isolation,
easier than separate databases. Cons: same migration complexity as separate
databases, Prisma's support for dynamic schema selection is limited.

### Decision Rationale
RLS adds a second enforcement layer directly in the database. Even if a bug in the
application layer omits a `familyId` filter, the database will reject the query
or return zero rows based on the RLS policy. Defence in depth: the application
must be compromised AND the database policy must fail for a data leak to occur.

The application sets the current `familyId` as a PostgreSQL session variable
(`SET LOCAL app.family_id = ?`) at the start of each request, after JWT
verification. RLS policies reference this variable.

Example policy:
```sql
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY family_isolation ON goals
  USING (family_id = current_setting('app.family_id')::uuid);
```

This is a production-grade pattern used by companies like Supabase for their
multi-tenant platform.

### Consequences
- Every database connection must set the `app.family_id` session variable before
  executing queries — enforced in the Fastify request lifecycle via the tenant
  middleware
- RLS policies must be created as a raw SQL migration (Prisma does not generate
  RLS policies natively) — use `prisma migrate dev --create-only`
- Performance overhead of RLS is minimal (a single equality check per row) —
  negligible at portfolio scale
- Prisma's connection pool must use a role that has RLS enforcement enabled —
  do not use the `postgres` superuser role in production, as superusers bypass RLS
- Testing requires setting the session variable in test setup — a small but
  important test infrastructure concern

---

## ADR-08: Decimal Over Float for Monetary Values

**Date:** 2026-03-09
**Status:** accepted

### Decision
Store all monetary amounts as `Decimal(12, 2)` in PostgreSQL rather than `Float`
or `Double`.

### Context
The finances module stores subscription and expense amounts that are used in
budget calculations, category aggregations, and tradeoff views. Arithmetic
precision matters.

### Why This Matters
IEEE 754 floating point (what `Float` maps to) cannot represent most decimal
fractions exactly. The number 0.1 in binary floating point is actually
0.1000000000000000055511151231257827021181583404541015625. This causes
well-known rounding errors:

```javascript
0.1 + 0.2 === 0.3  // false in JavaScript and most languages
```

For financial calculations:
```
£9.99 * 12 = £119.88
```
With Float, this might compute as £119.87999999999... and display incorrectly, or
round incorrectly when aggregated across many expenses.

### Decision Rationale
`Decimal(12, 2)` stores values as exact decimal numbers. 12 digits of precision
with 2 decimal places supports values up to £9,999,999,999.99 — sufficient for
household finances. Arithmetic on Decimal types is exact.

Prisma maps `Decimal` to the `Decimal.js` library in TypeScript, which maintains
precision through calculations.

### Consequences
- `Decimal` values from Prisma are `Decimal.js` objects, not JavaScript numbers —
  must use `.toNumber()` or `.toString()` for serialisation and display
- Arithmetic must use `Decimal.js` methods, not native `+`, `-`, `*` operators —
  a small discipline overhead worth enforcing via a lint rule
- Storage is slightly larger than Float (up to 18 bytes vs 8 bytes for Float) —
  negligible at this scale

---

## ADR-09: Schema Design for Future Multi-Tenancy (organisationId)

**Date:** 2026-03-09
**Status:** accepted

### Decision
Add a nullable `organisationId` field to the `Family` model now, even though V1
has no Organisation concept. Leave it nullable — a `null` value means a direct
B2C family. A populated value means the family belongs to a PaaS customer's
organisation.

```prisma
model Family {
  id             String  @id @default(uuid())
  organisationId String? // null = direct B2C, populated = PaaS org customer
  name           String
}
```

### Context
Weave's multi-tenant architecture currently treats `Family` as the root tenant
unit. This is correct for V1 — one family, one workspace. However, the
commercial scaling analysis (see SCALING.md) identifies a white-label PaaS model
as the highest-ceiling commercial path — selling Weave as infrastructure to
organisations (banks, schools, employers) who offer it to their own users.

This requires a two-level tenancy model:
```
Organisation (bank, school) → root tenant
  └── Family → sub-tenant
```

The question is: when do you add this to the schema?

### Alternatives Considered

**Add Organisation model and make organisationId required from V1**
Full two-level tenancy from day one. Pros: no future migration, always
production-ready for PaaS. Cons: significant added complexity for a feature that
is not needed in V1 and may never be needed. Requires Organisation management
UI, Organisation-level auth, per-org billing, feature flags — none of which have
validated demand yet. Classic over-engineering.

**Add nothing now, migrate the schema when needed**
Keep the schema clean, add Organisation later if PaaS becomes viable. Pros:
simplest V1 schema. Cons: the migration is more painful than it needs to be.
When `organisationId` is added later as non-nullable, every existing `Family`
row needs backfilling. If the table has millions of rows, this is a long-running
migration that requires careful coordination to avoid locking the table.

**Add nullable organisationId now**
One nullable field added to `Family`. No other changes. No Organisation model,
no new UI, no new routes. The field exists in the schema and is always `null`
in V1. When PaaS activation is needed: create the Organisation model, backfill
all existing families to a default "Direct" organisation, make the field
non-nullable in a follow-up migration.

### Decision Rationale
The nullable field approach is the minimum viable schema investment that
preserves the future option at near-zero cost:

- One additional column in one table
- No application logic changes
- No new UI
- No user-facing impact
- Backfill strategy is simple: all existing families get `organisationId = null`
  which means "direct B2C customer" — semantically correct
- When PaaS is activated, the migration is:
  1. Create Organisation table
  2. Insert one "Direct" organisation for existing B2C families (optional)
  3. Make organisationId non-nullable with a default for existing rows
  4. Add Organisation-level RLS policies
  5. Update JWT payload to include organisationId for PaaS tenants

This is a one-afternoon migration rather than a multi-day schema surgery.

### The Two-Level Tenancy Model (for reference when activating)

```prisma
model Organisation {
  id           String    @id @default(uuid())
  name         String
  slug         String    @unique
  plan         OrgPlan
  brandingJson Json?     // logo URL, primary colour, custom domain
  featureFlags Json?     // per-org feature enablement
  createdAt    DateTime  @default(now())

  families Family[]
  apiKeys  ApiKey[]
}

// When activated, Family.organisationId becomes non-nullable
model Family {
  id             String       @id @default(uuid())
  organisationId String       // non-nullable when PaaS is live
  name           String

  organisation   Organisation @relation(fields: [organisationId], references: [id])
}
```

**RLS policy update required when activating:**
```sql
-- Current V1 policy
CREATE POLICY family_isolation ON goals
  USING (family_id = current_setting('app.family_id')::uuid);

-- PaaS policy addition
CREATE POLICY org_isolation ON families
  USING (organisation_id = current_setting('app.organisation_id')::uuid);
```

**JWT payload update when activating:**
```typescript
// V1
interface JWTPayload {
  sub: string
  familyId: string
  role: FamilyRole
}

// PaaS activation
interface JWTPayload {
  sub: string
  familyId: string
  organisationId: string  // added
  orgRole: OrgRole        // OWNER | ADMIN | MEMBER
  familyRole: FamilyRole
}
```

### Consequences
- `organisationId` is always `null` in V1 — application code must handle this
  gracefully (it is nullable, so TypeScript enforces the null check)
- The field adds negligible storage overhead
- Queries that filter by `familyId` are unaffected — `organisationId` is not
  part of the V1 query pattern
- The Organisation model, API key management, webhook delivery, and white-label
  theming are all V2 concerns — not introduced by this ADR

### Migration Trigger
When any of these become true, activate the two-level tenancy model:
- A commercial organisation expresses interest in licensing Weave
- The decision is made to pursue the PaaS commercial path
- A second product (e.g. a school-specific version) is planned

---

## ADR-10: Jurisdiction-Aware Tax Rule Registry and Privacy-by-Design in TaxProfile

**Date:** 2026-03-09
**Status:** accepted

### Decision
Implement the tax insight engine as a jurisdiction-aware, annually-versioned rule
registry — where each tax rule is a self-contained, independently testable
function scoped to a specific country and tax year. Store only income brackets
in `TaxProfile`, never exact salary figures.

### Context
Weave V2 adds tax awareness as a feature layer on top of the existing insight
engine. Tax rules are:
- **Jurisdiction-specific** — German Kindergeld rules have no relevance to a
  French family
- **Annually versioned** — the 2024 Riester allowance (€2,100) differs from
  the 2025 allowance; insights must reflect the correct year's rules
- **Sensitive** — tax calculations touch income data, which is among the most
  sensitive personal financial information

Two distinct decisions are made here and documented together because they are
tightly coupled: the rule architecture and the data sensitivity design.

---

### Decision 1: Jurisdiction-Aware Rule Registry

**The pattern:**
```typescript
interface TaxInsightRule {
  id: string
  jurisdiction: string    // 'DE', 'FR', 'NL'
  taxYear: number         // 2024, 2025, 2026
  area: TaxArea           // CHILD_FAMILY, PENSION, INVESTMENT, PROPERTY
  check: (context: TaxContext) => Promise<TaxInsight | null>
  sources: string[]       // official source URLs — always cited in the insight
  disclaimer: string      // legal disclaimer — always shown with the insight
}

class TaxInsightRegistry {
  getRulesForJurisdiction(
    jurisdiction: string,
    taxYear: number
  ): TaxInsightRule[] {
    return this.rules.filter(
      r => r.jurisdiction === jurisdiction && r.taxYear === taxYear
    )
  }
}
```

**Alternatives Considered:**

*Single file of if/else conditions*
```typescript
if (jurisdiction === 'DE' && taxYear === 2024) {
  // German 2024 rules
} else if (jurisdiction === 'FR' && taxYear === 2024) {
  // French 2024 rules
}
```
Pros: simple to understand initially. Cons: the file becomes unmaintainable as
jurisdictions and years accumulate. Adding France 2025 rules requires editing
existing code, violating the Open/Closed Principle. Testing is harder —
you cannot test one country's rules in isolation.

*Separate rule engine per jurisdiction*
A separate module (de-tax-engine, fr-tax-engine) per country. Pros: complete
isolation. Cons: duplicates the engine infrastructure (runner, scheduler,
result writer) for every country. The insight runner logic is identical across
jurisdictions — only the rules differ.

**Decision Rationale:**
The registry pattern separates two concerns cleanly: the *engine* (how rules
are run, how results are stored, how insights are surfaced) and the *rules*
(what conditions to check per jurisdiction). The engine is written once. Rules
are data that the engine consumes.

Adding Germany 2026 rules means adding new `TaxInsightRule` objects — no
existing code changes. Adding France means adding French rule objects — German
rules are untouched. This is the Open/Closed Principle applied at a product
level: the system is open for extension, closed for modification.

Each rule is independently unit-testable:
```typescript
describe('de_kindergeld_tracker_2025', () => {
  it('surfaces insight when family has children and no claim confirmed', async () => {
    const context = buildTaxContext({ childrenCount: 2, kindergeldConfirmed: false })
    const insight = await kindergeldTrackerRule.check(context)
    expect(insight).not.toBeNull()
    expect(insight?.severity).toBe('WARNING')
  })

  it('returns null when kindergeld claim is confirmed', async () => {
    const context = buildTaxContext({ childrenCount: 2, kindergeldConfirmed: true })
    const insight = await kindergeldTrackerRule.check(context)
    expect(insight).toBeNull()
  })
})
```

**Consequences:**
- Tax rules are versioned alongside the codebase — rule changes are code changes,
  reviewed in PRs, tracked in git history
- Annual rule updates (when German tax law changes) require creating new rule
  objects for the new tax year, not modifying existing ones
- The existing `InsightSnapshot` model and insight worker infrastructure are
  reused without modification — tax insights are just more rules
- The rule registry must be updated manually when tax law changes — there is no
  automatic sync from an official tax rules API (V3 consideration)

---

### Decision 2: Privacy-by-Design in TaxProfile — Income Brackets Over Exact Figures

**The design:**
```prisma
enum IncomeBracket {
  UNDER_30K
  BETWEEN_30K_60K
  BETWEEN_60K_100K
  BETWEEN_100K_200K
  OVER_200K
}

model TaxProfile {
  householdIncomeBracket IncomeBracket  // never exact salary
}
```

**Why not store exact income?**

Exact income figures are among the most sensitive personal data a product can
hold. The consequences of a data breach involving exact salaries are severe —
reputational, professional, and in some jurisdictions, legal. The GDPR principle
of data minimisation requires collecting only what is necessary for the stated
purpose.

The question is: is exact income *necessary* for Weave's tax insights?

The answer is no. Every tax insight Weave surfaces in V2 requires only
bracket-level accuracy:

| Insight | Exact income needed? | Bracket sufficient? |
|---|---|---|
| Kinderfreibetrag vs Kindergeld | No — threshold is ~€70k combined | Yes |
| Günstigerprüfung eligibility | No — threshold is 25% tax rate | Yes |
| Riester allowance | No — fixed amounts per person/child | Yes |
| Rürup deduction limit | No — fixed annual maximum | Yes |
| Homeoffice-Pauschale | No — based on days, not income | Yes |

Brackets also reduce the sensitivity of the `TaxProfile` record as a whole.
Even if the table were exposed in a breach, income brackets reveal far less
than exact figures.

**What brackets cannot support (and how it's handled):**
The precise Kinderfreibetrag vs Kindergeld calculation requires exact income.
Weave handles this by surfacing a *directional* insight ("your income bracket
suggests this is worth exploring") rather than a definitive calculation, and
always recommending confirmation with a Steuerberater. This is the correct
product behaviour anyway — Weave is not a tax filing tool.

**Consequences:**
- `TaxProfile` is lower risk in a data breach than if it held exact salaries
- GDPR data minimisation principle is demonstrably applied — auditable
- Some insights are directional rather than precise — this is correct product
  behaviour for a non-regulated tool
- Users who want exact calculations are directed to ELSTER or a Steuerberater
- The `disclaimer` field on every `TaxInsightRule` enforces this boundary at
  the rule level — it cannot be accidentally omitted

---

### The Legal Boundary This Architecture Enforces

Every `TaxInsightRule` has two mandatory fields:
```typescript
sources: string[]   // e.g. ["https://www.bzst.de/kindergeld", "https://elster.de"]
disclaimer: string  // e.g. "This is for awareness only. Consult a Steuerberater
                    //        for advice specific to your situation."
```

These fields are not optional. The insight runner will not surface an insight
without both fields populated. This is enforced at the type level:

```typescript
// Both fields are required — TypeScript enforces this
interface TaxInsightRule {
  sources: [string, ...string[]]  // at least one source required
  disclaimer: string              // non-empty string required
}
```

This means:
- Every tax insight always cites an official source
- Every tax insight always carries a disclaimer
- No tax insight can be accidentally deployed without these fields

### Migration Trigger
- When a second EU jurisdiction is requested: add that country's rule objects
  to the registry, add its `TaxDeadline` seed data, update `TaxProfile` with
  any jurisdiction-specific fields needed
- When Weave grows to the point where a tax rules API (government or third-party)
  is available and reliable: consider replacing the manual annual rule update
  with an automated sync (V3)
- If Weave ever seeks FCA/BaFin authorisation as a financial advice tool:
  revisit the entire tax feature architecture with legal counsel

---

## How To Add a New ADR

When a significant technical decision is made, create a new entry in this file:

1. Increment the ADR number
2. Set status to `proposed` while discussing, `accepted` when decided
3. Fill in all sections: Decision, Context, Alternatives Considered, Decision
   Rationale, Consequences
4. Add a changelog entry in PRODUCT_BRIEF.md
5. If this ADR supersedes an existing one, update the old ADR's status to
   `superseded` and reference the new ADR number

**What counts as a significant decision:**
- Choosing between two or more reasonable technical approaches
- Changing a database schema in a non-trivial way
- Adding or removing a dependency that affects architecture
- Changing the deployment strategy
- Deciding NOT to do something that could reasonably be expected

**What does not need an ADR:**
- Dependency version bumps
- UI styling decisions
- Naming conventions (these live in .cursor/rules)
- Bug fixes
