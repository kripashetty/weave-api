# Weave — Product Brief

## One-Line Vision
A shared family command center that weaves together your time, money, and commitments — so you and your partner can see the full picture and make better decisions together.

---

## The Problem
Families manage their lives across fragmented tools — Google Calendar, Excel sheets, mental notes, banking apps. None of these talk to each other. The result is that the real tradeoffs stay invisible:

- You enroll a child in swimming lessons without seeing it will push kids' activity spend to 60% of your discretionary budget
- You commit to a personal growth goal with no time blocked in the calendar for it
- You haven't reviewed your subscriptions in six months and don't know what you're actually paying for
- You and your partner have no shared view of where things stand

Weave solves this not by replacing your existing tools, but by connecting them into one coherent view.

---

## The User
A couple managing a household with children. Both working. Both with their own goals alongside shared family goals. They want clarity, not complexity. They want to make intentional decisions about money and time — together.

---

## Core Rhythms
The product is built around three natural rhythms:

**Weekly** — are we making progress on what matters?
Check in on personal and family goals. See the week ahead across both calendars. Flag commitments with no time blocked.

**Monthly / Quarterly** — is our money going where we want it to go?
Review subscriptions and enrollments. See trends. Understand how spending on kids' activities trades off against savings goals and personal growth.

**Long-term** — are we moving toward the life we want?
Goals with time horizons. Spending patterns over time. A clear view of what changes if we add or remove a commitment.

---

## What Weave Is Not
- Not a budgeting app (not replacing YNAB or Mint)
- Not a calendar app (Google Calendar remains the source of truth)
- Not a task manager
- Not an AI assistant

Weave is a clarity layer on top of the tools you already use.

---

## Three Core Modules

### 1. Goals & Commitments
- Add goals for yourself, your partner, or your children
- Goals have: owner, category, target date, time horizon, linked expense (optional)
- Weekly check-in: on track / off track / blocked
- Insight: goals with no calendar time blocked are flagged
- Insight: goals with no check-in in 21+ days are flagged

### 2. Financial View
- Upload existing Excel sheet — platform parses and normalises it
- Log recurring expenses (subscriptions, enrollments, memberships)
- Categories: Kids Activities, Personal Growth, Household, Savings, Entertainment
- Monthly and quarterly summaries
- Tradeoff view: adding a new expense shows impact on budget and linked goals
- Insight: category spend up/down vs last quarter

### 3. Calendar View
- Read-only Google Calendar integration
- Both partners' calendars visible in one unified view
- See classes, meetings, commitments side by side
- Conflict detection: commitments with no time blocked surface as insights
- Google Calendar remains the source of truth — v1 is read-only

---

## The Insight Engine
Rule-based, not AI. Every insight is deterministic and explainable:

- "3 commitments have no time blocked this week"
- "Kids' activity spend is up 40% this quarter"
- "You haven't checked in on [goal] in 3 weeks"
- "Adding this enrollment takes kids' activities to 60% of discretionary budget"
- "You have 4 subscriptions renewing this month totalling £X"

Rule-based insights are more trustworthy than AI-generated ones for financial and family decisions. This is a deliberate product decision.

---

## Collaboration Model
- A **family** is the core tenant unit
- Two roles: `admin` (invites members, manages integrations) and `member` (full read/write on goals and check-ins)
- Both partners see the same dashboard
- Either partner can add goals, log expenses, do check-ins
- Both calendars visible in the unified calendar view

---

## Integrations
- **Google Calendar** — OAuth2, read-only, both partners' accounts, synced every 15 minutes via background worker
- **Excel upload** — client-side parsing via SheetJS, column mapping UI, idempotent upsert

---

## Market Context
- Mint shut down in 2024 — left a gap for household financial clarity tools
- YNAB is powerful but complex and focused on budgeting, not life management
- No existing tool connects time, money, and goals in one place for families
- The opportunity is not a better budgeting app — it is a family operating system

---

## Monetisation Direction (documented, not built in v1)
- Free: one family workspace, manual data entry
- Pro (£8/month): Google Calendar integration, Excel import, insights engine, weekly digest email
- The upgrade trigger is natural: users who connect their calendar see the most value

---

## Versioned Roadmap

This roadmap is the authoritative record of what is in scope at each version.
Before adding any feature, ask:
1. Does this solve a real problem I've personally felt?
2. Can I explain the technical decision it introduces?
3. Does it make the existing system better or just bigger?

If the answer to any of those is no — it goes in "future consideration" below, not in the code.

---

### V1 — The Foundation *(current)*
**Theme:** Core modules working, deployed, real data, used daily by a real family.

**In scope:**
- Goals & Commitments module — create, assign, weekly check-in
- Financial View — Excel import, manual expense logging, category summaries, tradeoff view
- Calendar View — read-only Google Calendar, both partners' accounts, unified view
- Insight Engine — rule-based, 5 core rules
- Collaboration — family workspace, ADMIN + MEMBER roles
- Auth — JWT + RBAC, refresh token rotation, stolen token detection
- Weekly digest email
- Deployed on AWS, CI/CD pipeline, full test coverage

**Deliberately excluded from V1:**
- Write-back to Google Calendar
- Bank/Plaid integration
- Mobile app
- AI-generated insights
- Benchmarking against other families
- Agentic automation

---

### V2 — Connected *(after V1 is stable and used)*
**Theme:** Weave becomes the source of truth. External data flows in automatically.

**Planned features:**
- **Google Calendar write-back** — create and edit events from Weave. Calendar sync becomes bidirectional. Google Calendar is no longer required as a separate app.
  - *Technical implication:* conflict resolution strategy needed. ADR required.
- **Bank / Plaid integration** — connect bank accounts for automatic transaction import. Replaces manual Excel upload.
  - *Technical implication:* Plaid webhook handler, transaction normalisation pipeline, PII handling review.
- **Subscription renewal alerts** — proactive push notifications and email before renewals hit.
  - *Technical implication:* notification preferences model, push notification infrastructure (web push or FCM).
- **Mobile-responsive PWA** — no native app, but the web app works well on mobile.
  - *Technical implication:* service worker, offline-first data for weekly check-ins.
- **Expanded insight rules** — 10+ rules including seasonal spend patterns, goal completion rate trends.

**Schema changes anticipated:**
- Add `BankAccount` and `Transaction` models
- Add `NotificationPreference` model per user
- Extend `CalendarEvent` with write fields (description, attendees, recurrence)
- Add `TaxProfile` and `TaxDeadline` models (already in schema — activated in V2)
- Add `INVESTMENT`, `PROPERTY`, `PENSION` to `ExpenseCategory` enum (already added)

---

### V2 Feature Spec: German Tax Insights (Jurisdiction: DE)

**Product boundary:**
Weave surfaces what a family *might be eligible for* and *when deadlines are*.
It never gives personalised tax advice. Every insight links to an official
source. Every insight carries a disclaimer: *"This is for awareness only —
consult a Steuerberater for your specific situation."*

This boundary is both a product decision and a legal protection.

**The four tax areas and their insights:**

#### Child & Family Benefits
- **Kindergeld tracker** — flags whether Kindergeld claim is active. €250/month per child for first two children (2024). Sourced from Familienkasse.
- **Kinderfreibetrag vs Kindergeld comparison** — surfaces when household income bracket suggests Kinderfreibetrag (€6,384/child) may be more beneficial than Kindergeld. Prompts discussion with Steuerberater.
- **Betreuungsfreibetrag tracker** — tracks childcare expenses logged as KIDS_ACTIVITIES. Up to €4,000/child (two-thirds of costs) deductible. Nudges to retain receipts.
- **Elterngeld deadline nudge** — if a child's DOB is within the last 3 months, surfaces the 3-month Elterngeld application deadline.

#### Pension & Retirement
- **Riester allowance tracker** — calculates household Riester allowance (€175 base + €185/child pre-2008 + €300/child post-2008). Tracks YTD contributions vs allowance remaining. Year-end top-up nudge before 31 December.
- **Rürup deduction nudge** — for self-employed families, surfaces the annual Rürup deduction limit (€27,566 in 2024). Flags if no PENSION expenses logged.
- **bAV reminder** — surfaces employer pension contribution allowance (€3,624 tax-free in 2024) as an unclaimed benefit check.

#### Investment & Capital Gains
- **Freistellungsauftrag utilisation** — tracks Sparerpauschbetrag usage (€1,000/person, €2,000/couple). Flags if not submitted to all banks/brokers.
- **Freistellungsauftrag split reminder** — if multiple investment accounts detected, nudges to distribute exemption across brokers.
- **Verlustverrechnungstopf awareness** — if capital losses logged, surfaces the loss pot rule — losses cannot transfer between brokers automatically.
- **Günstigerprüfung reminder** — if income bracket is UNDER_30K or BETWEEN_30K_60K, surfaces the option to apply for taxation at personal rate instead of flat 25%.

#### Property Ownership
- **Werbungskosten tracker** — for families with rental income, tracks deductible property expenses (mortgage interest, maintenance, management fees).
- **AfA depreciation reminder** — surfaces the 2% annual building value depreciation deduction for rental properties. Prompts Steuerberater confirmation.
- **Homeoffice-Pauschale tracker** — cross-references Google Calendar to count home office days. €6/day up to €1,260/year (2023 onwards). No dedicated room required.
- **Grunderwerbsteuer cost basis note** — if property purchase date is set in TaxProfile, surfaces that Grunderwerbsteuer is added to cost basis for rental properties (relevant for future capital gains).

**Tax deadline calendar layer:**
A toggleable layer in the Weave calendar view showing German tax deadlines as
virtual events — visually distinct from personal calendar events. Pre-seeded
annually by a background job. Dismissable per deadline once actioned.

Key 2025 German tax deadlines seeded:
- 31 July 2025 — Steuererklärung 2024 due (ELSTER)
- 31 December 2024 — Last day for Riester/Rürup contributions (2024 tax year)
- 15 January 2025 — Review Freistellungsauftrag allocations for 2025
- Quarterly — Vorauszahlungen reminders (for self-employed families)

**New background job — Tax Deadline Seeder:**
- Trigger: annual, run on 1 January each year
- Action: for each family with a TaxProfile, seed the relevant jurisdiction's
  deadlines for the new tax year into `tax_deadlines` table
- Source: hardcoded deadline registry per jurisdiction/year — manually updated
  annually as tax law changes. V3: source from a tax rules API if one becomes
  available.

**New background job — Tax Insight Recalculation:**
- Trigger: TaxProfile updated, expense in INVESTMENT/PROPERTY/PENSION category
  added, calendar synced (for Homeoffice-Pauschale), 1 January (new tax year)
- Action: run all tax insight rules for affected family's jurisdiction
- Rules registry: `TaxInsightRegistry.getRulesForJurisdiction('DE', 2025)`

---

### V3 — Intelligent *(after V2 is stable)*
**Theme:** Weave starts doing things, not just showing things.

**Planned features:**
- **AI-generated insights** — LLM layer on top of rule-based engine. Rules catch what's deterministic; AI surfaces patterns too complex to hardcode.
  - *Technical implication:* prompt design, output validation, cost management, fallback to rule-based when AI unavailable. ADR required.
  - *Product constraint:* AI insights are clearly labelled as suggestions, not directives. User trust is the priority.
- **Natural language goal setting** — "I want to save £5k by Christmas" parsed into a structured goal with milestones.
- **Agentic automation (opt-in)** — suggest cancelling unused subscriptions, automatically move money to savings on payday.
  - *Technical implication:* human-in-the-loop approval gate before any financial action. Every action logged with rationale. Full rollback capability.
  - *Product constraint:* no autonomous financial action without explicit per-action user approval in V3.
- **Anonymised family benchmarking** — opt-in comparison against similar families (same household size, income bracket, age of children).
  - *Technical implication:* anonymisation pipeline, aggregate compute jobs, opt-in consent model. Only possible with meaningful user base.

---

### Future Consideration *(no version assigned yet)*
Ideas that are interesting but not yet justified:

- Native iOS / Android app
- Shared family goals with external contributors (grandparents contributing to a child's education fund)
- Integration with school management systems (iSAMS, SIMS) for automatic enrollment tracking
- Financial advisor sharing mode — read-only view for a trusted third party

---

## How To Evolve This Document

**Refining an existing feature** — update the relevant section directly. Add a changelog entry explaining what changed and why.

**Promoting a feature from a future version** — move it into the current version's scope, update the schema if needed, add an ADR if a technical decision is involved, add a changelog entry.

**Adding a net new idea** — add it to Future Consideration first. Only promote to a versioned milestone after you can answer the three questions above.

**Changing a technical decision** — always write an ADR. Update the relevant section. Never silently change an architectural decision without a record.

---

---

# Technical Specification

## Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS | Industry standard, SSR, App Router |
| Backend API | Fastify, TypeScript | Schema-first, fast, better TS than Express |
| ORM | Prisma | Schema-first, auto-generated types, migrations |
| Database | PostgreSQL | Relational integrity, RLS for tenant isolation |
| Cache | Redis (Upstash) | Dashboard caching, session storage |
| Queue | AWS SQS | Background jobs, calendar sync, digest emails |
| Auth | Custom JWT + RBAC | No third-party dependency, full control |
| Email | AWS SES | Weekly digest, reminders |
| Infra | Terraform + AWS | IaC, reproducible environments |
| CI/CD | GitHub Actions | Automated pipeline |

---

## Repository Structure

### weave-web (Next.js)
```
weave-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Weekly dashboard
│   │   │   ├── goals/
│   │   │   ├── finances/
│   │   │   └── calendar/
│   │   └── api/
│   │       └── auth/
│   ├── components/
│   │   ├── ui/                       # Primitives (button, input, card)
│   │   ├── goals/
│   │   ├── finances/
│   │   ├── calendar/
│   │   └── insights/
│   ├── lib/
│   │   ├── api-client.ts             # Typed fetch wrapper for weave-api
│   │   ├── auth.ts                   # JWT decode, session helpers
│   │   └── utils.ts
│   └── types/
│       └── index.ts                  # Shared with weave-api via @weave/types
├── .cursor/
│   └── rules
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

### weave-api (Fastify)
```
weave-api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.test.ts
│   │   ├── family/
│   │   ├── goals/
│   │   ├── finances/
│   │   ├── calendar/
│   │   └── insights/
│   ├── shared/
│   │   ├── db/
│   │   │   └── prisma.ts             # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── authenticate.ts       # JWT verification
│   │   │   └── tenant.ts             # family_id injection
│   │   ├── jobs/
│   │   │   ├── calendar-sync.ts
│   │   │   ├── weekly-digest.ts
│   │   │   └── insight-recalc.ts
│   │   └── events/
│   │       └── publisher.ts          # SQS event publisher
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .cursor/
│   └── rules
├── .env.example
└── README.md
```

---

## Database Schema (Prisma)

> Last updated: 2026-03-09 — V1 gaps resolved. See changelog for details.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Tenancy ────────────────────────────────────────────────
//
// Family is the root tenant. Every top-level model carries familyId.
// Row-level security is enforced at the DB layer — not just application layer.
// UUIDs used throughout: prevents sequential enumeration, safe to expose in URLs.

model Family {
  id             String   @id @default(uuid())
  // null = direct B2C family. populated = family belongs to a PaaS org customer.
  // V2: create Organisation model, make non-nullable. See ADR-09.
  organisationId String?
  name           String
  createdAt      DateTime @default(now())

  members          User[]
  goals            Goal[]
  expenses         Expense[]
  calendarAccounts CalendarAccount[]
  insightSnapshots InsightSnapshot[]

  @@index([organisationId])  // fast org-scoped queries when PaaS is activated
  @@map("families")
}

model User {
  id           String     @id @default(uuid())
  familyId     String
  email        String     @unique
  passwordHash String
  name         String
  role         FamilyRole @default(MEMBER)
  // Google OAuth refresh token — AES-256 encrypted at application layer.
  // V2: migrate to AWS Secrets Manager, store only a secret reference here.
  googleRefreshTokenEnc String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt  // FIX: track when user profile changes

  family           Family            @relation(fields: [familyId], references: [id], onDelete: Cascade)
  goals            Goal[]            @relation("GoalOwner")
  checkins         GoalCheckin[]
  calendarAccounts CalendarAccount[]

  @@index([familyId])  // FIX: always query users by familyId — index makes this fast
  @@map("users")
}

enum FamilyRole {
  ADMIN
  MEMBER
}

// ─── Goals ──────────────────────────────────────────────────
//
// Goals are soft-deleted (archivedAt) — hard delete destroys check-in history.
// requiresTimeBlock drives conflict detection in the insight engine.
// V2: replace requiresTimeBlock with weeklyTimeCommitmentMinutes for richer insights.

model Goal {
  id                String       @id @default(uuid())
  familyId          String
  ownerId           String
  title             String
  category          GoalCategory
  targetDate        DateTime?
  requiresTimeBlock Boolean      @default(false)
  notes             String?
  archivedAt        DateTime?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt  // FIX: track goal edits

  family   Family        @relation(fields: [familyId], references: [id], onDelete: Cascade)
  owner    User          @relation("GoalOwner", fields: [ownerId], references: [id])
  checkins GoalCheckin[]
  expenses Expense[]     @relation("GoalExpense")

  @@index([familyId])
  @@index([familyId, archivedAt])  // FIX: fast query for active goals per family
  @@map("goals")
}

// GoalCheckin is an immutable record — never updated, only inserted.
// One check-in per goal per week enforced via unique constraint.
// weekStart is always the Monday of that week (normalised in application layer).
model GoalCheckin {
  id          String        @id @default(uuid())
  goalId      String
  userId      String
  weekStart   DateTime      // FIX: Monday of the check-in week — normalised to 00:00:00 UTC
  status      CheckinStatus
  note        String?
  checkedInAt DateTime      @default(now())

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  // FIX: one check-in per goal per week — prevents duplicate check-ins
  @@unique([goalId, weekStart])
  @@index([goalId])
  @@map("goal_checkins")
}

enum GoalCategory {
  PERSONAL_GROWTH
  KIDS_DEVELOPMENT
  FAMILY
  HEALTH
  FINANCIAL
  OTHER
}

enum CheckinStatus {
  ON_TRACK
  OFF_TRACK
  BLOCKED
  COMPLETED
}

// ─── Finances ───────────────────────────────────────────────
//
// Expense holds current state. ExpenseEvent holds immutable history.
// These two tables must never diverge. Expense is the source of truth.
// On any write to Expense, an ExpenseEvent must be written in the same transaction.
// updatedAt on Expense lets us detect stale cache without querying the event log.

model Expense {
  id           String          @id @default(uuid())
  familyId     String
  name         String
  amount       Decimal         @db.Decimal(12, 2)  // FIX: Decimal over Float — avoids floating point rounding on money
  currency     String          @default("GBP")
  category     ExpenseCategory
  recurrence   Recurrence
  nextDueDate  DateTime?
  linkedGoalId String?
  source       ExpenseSource   @default(MANUAL)
  isActive     Boolean         @default(true)      // FIX: soft delete — deactivate instead of deleting
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  family     Family         @relation(fields: [familyId], references: [id], onDelete: Cascade)
  linkedGoal Goal?          @relation("GoalExpense", fields: [linkedGoalId], references: [id])
  events     ExpenseEvent[]

  @@index([familyId])
  @@index([familyId, isActive])        // FIX: fast query for active expenses
  @@index([familyId, category])        // FIX: fast category aggregations for financial view
  @@index([nextDueDate])               // FIX: fast query for upcoming renewals
  @@map("expenses")
}

// Append-only audit log — NEVER update or delete rows in this table.
// Every write to Expense must produce a corresponding ExpenseEvent in the same DB transaction.
// payload stores full snapshot — enables point-in-time reconstruction without replaying diffs.
// Source of truth conflict rule: if Expense and ExpenseEvent diverge, Expense wins.
// The event log is for audit and history — not for rebuilding state.
model ExpenseEvent {
  id        String            @id @default(uuid())
  expenseId String
  eventType ExpenseEventType  // FIX: enum instead of free string — prevents invalid event types
  payload   Json              // full Expense snapshot at time of event
  createdAt DateTime          @default(now())

  expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)

  @@index([expenseId])
  @@index([createdAt])  // FIX: fast time-range queries on expense history
  @@map("expense_events")
}

// FIX: typed enum for event types — prevents "CREATD" typo bugs
enum ExpenseEventType {
  CREATED
  UPDATED
  DEACTIVATED  // replaces DELETED — we soft delete expenses, not hard delete
}

enum ExpenseCategory {
  KIDS_ACTIVITIES
  PERSONAL_GROWTH
  HOUSEHOLD
  SAVINGS
  ENTERTAINMENT
  SUBSCRIPTIONS
  INVESTMENT    // V2: dividends, broker fees — feeds into Kapitalerträge insights
  PROPERTY      // V2: mortgage, maintenance, AfA — feeds into Werbungskosten insights
  PENSION       // V2: Riester, Rürup, bAV contributions — feeds into pension insights
  OTHER
}

enum Recurrence {
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUAL
  ONE_OFF
}

enum ExpenseSource {
  MANUAL
  EXCEL_IMPORT
}

// ─── Calendar ───────────────────────────────────────────────
//
// CalendarAccount abstracts the provider — supports Google now, Outlook in V2.
// CalendarEvent is a local read cache — synced every 15 minutes from Google Calendar API.
// Google Calendar remains the source of truth in V1.
// The @@unique constraint on [calendarAccountId, externalId] makes sync idempotent.

model CalendarAccount {
  id           String    @id @default(uuid())
  userId       String
  familyId     String
  provider     String    @default("google")
  // FIX: store the Google Calendar ID (e.g. primary, or a specific calendar)
  // Allows users to connect a specific calendar rather than defaulting to primary
  providerAccountId String?
  lastSyncedAt DateTime?
  // FIX: track sync failures — if syncFailureCount > 3, surface an insight to reconnect
  syncFailureCount  Int       @default(0)
  createdAt         DateTime  @default(now())

  user   User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  family Family          @relation(fields: [familyId], references: [id], onDelete: Cascade)
  events CalendarEvent[]

  @@index([familyId])
  @@map("calendar_accounts")
}

// Local cache of Google Calendar events — synced every 15 minutes.
// Never treat this as a source of truth — always re-sync if data seems stale.
// FIX: added color and description fields — needed for visual calendar rendering
// FIX: added deletedAt for soft-deleted events (when Google event is cancelled)
model CalendarEvent {
  id                String    @id @default(uuid())
  calendarAccountId String
  familyId          String    // FIX: denormalised for fast family-scoped calendar queries
  externalId        String    // Google Calendar event ID
  title             String
  description       String?   // FIX: store description for context in conflict detection
  startTime         DateTime
  endTime           DateTime
  isAllDay          Boolean   @default(false)
  color             String?   // FIX: preserve Google Calendar event colour for UI
  deletedAt         DateTime? // FIX: soft delete — when Google event is cancelled, mark here
  syncedAt          DateTime  @default(now())

  calendarAccount CalendarAccount @relation(fields: [calendarAccountId], references: [id], onDelete: Cascade)

  @@unique([calendarAccountId, externalId])
  @@index([familyId, startTime, endTime])  // FIX: fast date-range queries for calendar view
  @@index([familyId, deletedAt])           // FIX: fast query for active events only
  @@map("calendar_events")
}

// ─── Insights ───────────────────────────────────────────────
//
// Insights are pre-computed by the insight worker and stored as snapshots.
// Reading insights is fast — no joins at render time.
// dismissedAt: user has acknowledged and cleared this insight.
// resolvedAt: the underlying condition is no longer true — insight is stale.
// re-surfaces after 7 days if condition returns, even if previously dismissed.

model InsightSnapshot {
  id          String          @id @default(uuid())
  familyId    String
  ruleId      String          // e.g. "unblocked_commitments", "goal_neglect"
  message     String
  severity    InsightSeverity @default(INFO)
  // FIX: metadata stores rule-specific context for rendering rich insight cards
  // e.g. { goalId: "...", goalTitle: "Train for 5k", daysSinceCheckin: 24 }
  metadata    Json?
  generatedAt DateTime        @default(now())
  dismissedAt DateTime?
  // FIX: resolvedAt tracks when the condition that triggered this insight no longer applies
  // Insight worker sets this when re-running rules and finding the condition resolved
  resolvedAt  DateTime?

  family Family @relation(fields: [familyId], references: [id], onDelete: Cascade)

  // FIX: one active insight per rule per family — prevents duplicate insights stacking up
  @@unique([familyId, ruleId, resolvedAt])
  @@index([familyId, resolvedAt, dismissedAt])  // FIX: fast query for active undismissed insights
  @@map("insight_snapshots")
}

enum InsightSeverity {
  INFO
  WARNING
  CRITICAL
}

// ─── Tax (V2) ────────────────────────────────────────────────
//
// TaxProfile stores the jurisdiction and household context needed to run
// tax insight rules. Uses income brackets deliberately — Weave never stores
// exact salary figures. See ADR-10.
//
// One TaxProfile per family. Updated annually or when household situation changes.
// taxYear tracks which year the profile reflects — rules change annually.

model TaxProfile {
  id                   String         @id @default(uuid())
  familyId             String         @unique
  jurisdiction         String         // ISO country code: 'DE', 'FR', 'NL' etc
  taxYear              Int            // e.g. 2025
  filingStatus         GermanTaxClass
  householdIncomeBracket IncomeBracket
  isMarried            Boolean        @default(false)
  isSelfEmployed       Boolean        @default(false)
  hasRentalIncome      Boolean        @default(false)
  childrenCount        Int            @default(0)
  // Store child DOBs for Kindergeld/Riester/Kinderfreibetrag calculations
  // Riester: €300/child born after 2008, €185/child born before 2008
  childrenDOB          DateTime[]
  // Freistellungsauftrag: total Sparerpauschbetrag allocated across all banks
  // €1,000/person, €2,000/couple — tracked to surface utilisation insights
  freistellungsauftrag Decimal?       @db.Decimal(10, 2)
  // YTD pension contributions — for Riester/Rürup allowance tracking
  pensionContribYTD    Decimal?       @db.Decimal(10, 2)
  // Property purchase date — for AfA depreciation and cost basis tracking
  propertyPurchaseDate DateTime?
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  family              Family           @relation(fields: [familyId], references: [id], onDelete: Cascade)
  taxDeadlines        TaxDeadline[]

  @@map("tax_profiles")
}

// Tax deadlines are surfaced as a virtual calendar layer in the UI.
// They are pre-seeded per jurisdiction/year by a background job.
// Families can dismiss individual deadlines once actioned.
model TaxDeadline {
  id           String    @id @default(uuid())
  taxProfileId String
  jurisdiction String    // 'DE'
  taxYear      Int
  deadlineKey  String    // e.g. 'de_steuererklaerung', 'de_riester_contribution'
  title        String
  description  String
  dueDate      DateTime
  sourceUrl    String    // always link to official source (ELSTER, Bundeszentralamt etc)
  dismissedAt  DateTime?
  createdAt    DateTime  @default(now())

  taxProfile TaxProfile @relation(fields: [taxProfileId], references: [id], onDelete: Cascade)

  @@unique([taxProfileId, deadlineKey, taxYear]) // one deadline entry per key per year
  @@index([taxProfileId, dueDate])               // fast upcoming deadline queries
  @@map("tax_deadlines")
}

enum GermanTaxClass {
  KLASSE_I    // single
  KLASSE_II   // single parent
  KLASSE_III  // married, higher earner
  KLASSE_IV   // married, similar income
  KLASSE_V    // married, lower earner
  KLASSE_VI   // second job
}

// Income brackets — deliberately coarse. Weave never stores exact salary.
// Bracket-level accuracy is sufficient for rule-based tax insights.
// See ADR-10: Privacy-by-Design in TaxProfile.
enum IncomeBracket {
  UNDER_30K
  BETWEEN_30K_60K
  BETWEEN_60K_100K
  BETWEEN_100K_200K
  OVER_200K
}
```

---

## Auth Design

### JWT Payload
```typescript
interface JWTPayload {
  sub: string        // user_id
  familyId: string   // tenant identifier
  role: 'ADMIN' | 'MEMBER'
  iat: number
  exp: number
}
```

### Token Strategy
- Access token: 15 minute expiry, signed with RS256
- Refresh token: 30 day expiry, stored in Redis, rotated on every use
- Stolen token detection: if refresh token used twice, invalidate all family sessions
- Passwords: bcrypt with cost factor 12

### RBAC Rules
- `ADMIN`: full read/write, invite members, connect integrations, manage family settings
- `MEMBER`: full read/write on goals and check-ins, read-only on financial settings and integrations

---

## Background Jobs

### 1. Calendar Sync Worker
- Trigger: SQS message on schedule (every 15 minutes via EventBridge)
- Action: fetch events from Google Calendar API for all connected accounts, upsert into `calendar_events` table
- On completion: publish `CALENDAR_SYNCED` event → triggers insight recalculation

### 2. Weekly Digest Worker
- Trigger: SQS message every Sunday at 18:00 family local time
- Action: aggregate week's check-ins, goal progress, upcoming calendar events
- Output: email via SES with weekly summary

### 3. Insight Recalculation Worker
- Trigger: SQS message published after any data change (expense added, goal updated, calendar synced)
- Action: run all insight rules for the affected family, upsert into `insight_snapshots` table
- Output: invalidate Redis dashboard cache for that family

---

## AWS Deployment

| Component | Service |
|---|---|
| Frontend | Vercel (Next.js — free tier) |
| API | ECS Fargate (or EC2 t3.micro free tier) |
| Database | RDS PostgreSQL t3.micro |
| Cache | Upstash Redis (free tier) |
| Queue | SQS |
| Email | SES |
| Scheduling | EventBridge |
| Secrets | AWS Secrets Manager |
| CI/CD | GitHub Actions → ECR → ECS |
| Infra as code | Terraform |

---

## Architecture Decision Records

All ADRs are maintained in `ARCHITECTURE_DECISIONS.md`.

- **ADR-01:** Modular monolith over microservices
- **ADR-02:** Two separate repos over monorepo
- **ADR-03:** Local calendar cache over live API calls
- **ADR-04:** Rule-based insights over AI/ML
- **ADR-05:** Client-side Excel parsing for privacy
- **ADR-06:** Prisma over raw SQL for maintainability
- **ADR-07:** Row-level security at DB layer for tenant isolation
- **ADR-08:** Decimal over Float for monetary values
- **ADR-09:** Nullable organisationId for future multi-tenancy
- **ADR-10:** Jurisdiction-aware tax rule registry and privacy-by-design in TaxProfile

---

## Coding Conventions

- All functions return `Result<T, Error>` types — no throwing exceptions across module boundaries
- All API routes have Zod schema validation on request and response
- All database queries go through the repository layer — no Prisma calls in route handlers
- Business logic lives in the service layer only
- Every module has: `routes.ts`, `service.ts`, `repository.ts`, `schema.ts`, `test.ts`
- No `any` types — TypeScript strict mode enforced
- All environment variables validated on startup via Zod
- Errors are logged with context, never swallowed

---

## Changelog

Every meaningful change to this document is recorded here. This creates a visible
history of how the product and architecture thinking evolved — which is itself a
portfolio artifact worth showing.

Format:
`[YYYY-MM-DD] [type: PRODUCT | TECHNICAL | SCOPE] — description — reason`

Types:
- **PRODUCT** — change to what the product does or how it works
- **TECHNICAL** — change to architecture, stack, or technical decisions
- **SCOPE** — feature added to or removed from a version milestone

---

### 2026-03-09
`[PRODUCT] Initial product brief created — Weave v1 defined`
First complete definition of the product vision, three core modules, insight engine, collaboration model, and monetisation direction. Based on personal need: managing family finances, goals, and calendar commitments in one place.

`[TECHNICAL] Stack selected — Next.js 14, Fastify, Prisma, PostgreSQL, Redis, SQS, AWS`
Next.js chosen over plain React SPA for job market relevance and SSR capability. Fastify chosen over Express for TypeScript-first, schema-driven approach. Prisma chosen for type-safe database access and migration management. Two separate repos chosen over monorepo — shared surface area did not justify tooling overhead at this stage.

`[TECHNICAL] Auth design finalised — custom JWT + RBAC, no third-party auth provider`
Custom JWT chosen to demonstrate security thinking in portfolio context. RS256 signing, 15-minute access tokens, 30-day rotating refresh tokens, stolen token detection. Two roles: ADMIN and MEMBER at the family level.

`[SCOPE] Versioned roadmap added — V1, V2, V3 milestones defined`
V1: core modules, deployed, real usage. V2: bidirectional integrations, Plaid, PWA. V3: AI insights, agentic automation, benchmarking. Benchmarking removed from V1 scope — requires user base that doesn't exist yet.

`[PRODUCT] Feature evolution process defined`
Three-question framework before adding any feature. Changelog format established. Rules for promoting features between versions documented.

### 2026-03-09 (schema review)
`[TECHNICAL] V1 schema gaps identified and resolved`
Eight gaps fixed in the Prisma schema. Full list:
1. GoalCheckin — added weekStart field and @@unique([goalId, weekStart]) to enforce one check-in per goal per week
2. Expense.amount — changed Float to Decimal(12,2) to avoid floating point rounding errors on monetary values
3. Expense — added isActive boolean for soft delete instead of hard delete. DELETED event type replaced with DEACTIVATED
4. ExpenseEvent.eventType — changed free String to typed ExpenseEventType enum to prevent invalid event type bugs
5. InsightSnapshot — added resolvedAt to track when insight conditions clear. Added metadata Json field for rich insight context. Added @@unique([familyId, ruleId, resolvedAt]) to prevent duplicate stacking insights
6. CalendarEvent — added familyId denormalisation for fast family-scoped queries. Added description, color, deletedAt fields
7. CalendarAccount — added providerAccountId and syncFailureCount fields
8. All models — added missing indexes on familyId, date ranges, and soft-delete fields. Added @@map() table name conventions. Added updatedAt where appropriate. Added onDelete: Cascade on all child relations

### 2026-03-09 (scaling analysis)
`[TECHNICAL] SCALING.md created — bottleneck analysis and commercial paths documented`
Five bottlenecks identified in order of impact: database connections, dashboard query performance, calendar sync throughput, insight recalculation volume, monolith extraction. Three commercial paths documented: B2C SaaS, white-label PaaS, API-first platform. Infrastructure roadmap from V1 to Stage 4 (10,000+ families) defined.

`[TECHNICAL] ADR-09 added — nullable organisationId on Family model`
One nullable field added to Family model to preserve the two-level tenancy option without committing to full PaaS architecture in V1. Backfill strategy documented. Migration trigger defined. See ADR-09 in ARCHITECTURE_DECISIONS.md.

`[SCOPE] organisationId added to Family schema — V1 change`
Family.organisationId added as nullable String. No application logic changes. No new UI. Semantically: null = direct B2C family, populated = PaaS organisation customer.

### 2026-03-09 (tax insights)
`[SCOPE] German tax insights feature spec added to V2 roadmap`
Four tax areas defined for Germany: child & family benefits (Kindergeld, Kinderfreibetrag, Betreuungsfreibetrag, Elterngeld), pension contributions (Riester, Rürup, bAV), investment & capital gains (Freistellungsauftrag, Verlustverrechnungstopf, Günstigerprüfung), property ownership (Werbungskosten, AfA, Homeoffice-Pauschale, Grunderwerbsteuer). Tax deadline calendar layer defined. Two new background jobs specified: Tax Deadline Seeder and Tax Insight Recalculation.

`[TECHNICAL] TaxProfile and TaxDeadline models added to schema`
TaxProfile stores jurisdiction context for tax insight engine. Uses IncomeBracket enum deliberately — Weave never stores exact salary figures (privacy-by-design). GermanTaxClass enum covers all six Steuerklassen. TaxDeadline stores jurisdiction-specific deadlines pre-seeded annually. One TaxProfile per family. See ADR-10.

`[TECHNICAL] ExpenseCategory enum extended — INVESTMENT, PROPERTY, PENSION added`
Three new categories added to support tax insight rules: INVESTMENT (dividends, broker fees → Kapitalerträge insights), PROPERTY (mortgage, maintenance → Werbungskosten insights), PENSION (Riester, Rürup, bAV → pension allowance insights). Categories marked as V2 in enum comments — existing V1 data unaffected.

`[TECHNICAL] ADR-10 added — jurisdiction-aware tax rule registry`
TaxInsightRule registry pattern documented. Rules are jurisdiction-scoped and taxYear-versioned. Adding a new country means adding new rules — existing rules are never modified. Privacy-by-design rationale for IncomeBracket over exact income documented.
