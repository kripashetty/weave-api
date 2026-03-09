# Weave — Scaling Strategy

> This document covers how Weave scales from a single-family deployment to a
> commercial platform. It is written at V1 to inform architectural decisions made
> now that would otherwise be expensive to change later.
>
> Last updated: 2026-03-09

---

## Current State (V1)

Weave is deployed as a single-tenant-aware multi-tenant system. One deployment
serves all families. Tenant isolation is enforced at the database layer via
PostgreSQL Row-Level Security and at the application layer via JWT-injected
`familyId` on every query.

```
Current load profile:
- 1 family (2 active users)
- ~50 API requests/day
- 1 calendar sync every 15 minutes
- 1 weekly digest email
- ~100 expenses, ~20 goals, ~500 calendar events

Infrastructure:
- 1 ECS Fargate task (API)
- 1 ECS Fargate task (workers)
- 1 RDS PostgreSQL t3.micro
- Upstash Redis (free tier)
- SQS queues
```

This is deliberately minimal. The architecture is correct — the infrastructure
is just small.

---

## Scaling Dimensions

There are four independent dimensions Weave needs to scale across:

1. **Families** — number of tenant units
2. **Users per family** — currently 2, could be more in extended family model
3. **Data volume** — expenses, events, check-ins accumulate over time
4. **Background job throughput** — calendar syncs, insight recalculations

Each dimension has a different bottleneck and a different fix.

---

## Bottleneck Analysis — In Order of Impact

### Bottleneck 1: Database Connections (~500+ daily active families)

**What breaks:** PostgreSQL has a hard limit on concurrent connections. Each
API server instance holds a pool of connections. As you add API instances to
handle more traffic, you consume more connections. RDS t3.micro supports ~87
max connections. Even t3.medium only supports ~170.

**Symptoms:**
- `too many connections` errors under load
- API requests queuing waiting for a connection
- Intermittent 500 errors during peak usage

**Fix — Connection Pooling (PgBouncer or RDS Proxy)**

PgBouncer sits between the application and PostgreSQL and multiplexes many
application connections onto a smaller number of actual database connections.
1,000 application connections → 20 real database connections.

```
Before:
API instance 1 ──10 connections──┐
API instance 2 ──10 connections──┤──► RDS PostgreSQL (87 max)
API instance 3 ──10 connections──┘

After with PgBouncer:
API instance 1 ──10 connections──┐
API instance 2 ──10 connections──┤──► PgBouncer ──20 connections──► RDS PostgreSQL
API instance 3 ──10 connections──┘
```

AWS RDS Proxy is the managed alternative — no self-hosted PgBouncer to operate.
Worth the cost (~$0.015/hour) at commercial scale.

**Implementation effort:** Medium. Requires updating DATABASE_URL to point at
the proxy. No application code changes. Add as Terraform module.

---

### Bottleneck 2: Dashboard Query Performance (~1,000+ active families)

**What breaks:** The dashboard aggregates data across goals, expenses, calendar
events, and insights in a single view. As data volume grows per family
(thousands of expenses, years of calendar events), these queries slow down.

**Symptoms:**
- Dashboard load time increasing over time for older families
- Database CPU spiking during peak usage windows

**Fix 1 — Query Optimisation**
The schema already has indexes on `familyId`, `isActive`, `category`,
`startTime/endTime`, and `resolvedAt`. Review query plans with `EXPLAIN ANALYZE`
for the five most expensive dashboard queries. Most slow queries are index misses
or N+1 problems.

**Fix 2 — Read Replica**
Separate read traffic (dashboard, calendar view, financial summaries) from write
traffic (new expenses, check-ins, goal updates). Dashboard queries hit the read
replica. Writes go to primary. RDS supports up to 5 read replicas.

```
Writes ──► RDS Primary
Reads  ──► RDS Read Replica
```

In Prisma, this is a one-line change:
```typescript
// prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },          // primary (writes)
    dbRead: { url: process.env.DATABASE_READ_URL }  // replica (reads)
  }
})
```

**Fix 3 — Redis Dashboard Cache**
Already designed. The insight worker invalidates the Redis cache when underlying
data changes. The dashboard reads from cache when available. Cache hit rate
should be >95% for normal usage patterns (data changes infrequently relative to
dashboard reads).

**Implementation effort:** Fix 1 is ongoing. Fix 2 is medium (Terraform change +
repository layer update). Fix 3 is already built.

---

### Bottleneck 3: Calendar Sync Throughput (~2,000+ connected calendars)

**What breaks:** The sync worker polls Google Calendar API every 15 minutes for
all connected accounts. At 2,000 accounts, that is 2,000 API calls every 15
minutes — 133 calls/minute. Google's per-user rate limit is 10 requests/second,
but the aggregate quota and the operational burden of managing failures at this
volume becomes significant.

**Symptoms:**
- Calendar sync falling behind — events appear with increasing delay
- SQS queue depth growing (workers can't keep up)
- Sync failures for some families during peak periods

**Fix 1 — Horizontal Worker Scaling**
The worker is already an SQS consumer. Running more worker instances means more
parallel sync jobs. ECS auto-scaling based on SQS queue depth handles this
automatically:

```
SQS Queue Depth > 100  → scale workers up
SQS Queue Depth < 10   → scale workers down
```

Add this as an ECS Application Auto Scaling policy in Terraform.

**Fix 2 — Tiered Sync Frequency**
Not all families need 15-minute sync. Implement tiered polling:

| Activity Level | Sync Frequency |
|---|---|
| Active (used in last 7 days) | Every 15 minutes |
| Moderate (used in last 30 days) | Every 60 minutes |
| Inactive (not used in 30+ days) | Every 6 hours |

This reduces API calls by ~60% without meaningful UX degradation for inactive
families.

**Fix 3 — Google Push Notifications (V2)**
Replace polling entirely. Google Calendar supports push notifications — register
a webhook endpoint and Google calls you when a calendar changes. Zero polling,
real-time updates, dramatic API call reduction.

```
Current (polling):
Weave ──every 15 min──► Google Calendar API

V2 (push):
Google Calendar ──on change──► Weave webhook endpoint
                               → upsert changed events
                               → trigger insight recalculation
```

This is the correct long-term architecture. Polling is a V1 pragmatic choice
explicitly planned for replacement.

**Implementation effort:** Fix 1 is low (Terraform change). Fix 2 is medium
(add activity tracking, update scheduler). Fix 3 is high (new webhook
infrastructure, Google push notification registration, event deduplication).

---

### Bottleneck 4: Insight Recalculation Volume (~5,000+ families)

**What breaks:** Every data change (expense added, goal updated, calendar synced)
publishes an event to SQS that triggers insight recalculation for that family.
At scale, a busy period (Sunday evening when many families do their weekly
check-in) creates a spike of recalculation jobs.

**Symptoms:**
- Insights stale for minutes after data changes during peak periods
- SQS dead-letter queue accumulating failed jobs

**Fix 1 — Debounce Recalculation**
Instead of recalculating on every data change, debounce per family:

```
Family A expense added  ──► schedule recalc in 30 seconds
Family A goal updated   ──► reset 30 second timer
30 seconds with no changes ──► run recalculation once
```

This collapses multiple rapid changes into a single recalculation job. Implement
with a Redis key per family with a 30-second TTL.

**Fix 2 — Partial Recalculation**
Instead of running all insight rules on every trigger, run only the rules
affected by the change type:

```typescript
const RULES_BY_TRIGGER = {
  EXPENSE_ADDED: ['budget_pressure', 'category_spend', 'subscription_renewal'],
  GOAL_UPDATED:  ['unblocked_commitments', 'goal_neglect'],
  CALENDAR_SYNCED: ['unblocked_commitments', 'time_conflicts'],
}
```

**Fix 3 — Horizontal Worker Scaling**
Same as calendar sync — SQS consumers scale horizontally by running more
instances. ECS auto-scaling handles this.

**Implementation effort:** Fix 1 is low (Redis debounce, ~2 hours).
Fix 2 is medium (refactor insight engine trigger mapping).
Fix 3 is already supported by the architecture.

---

### Bottleneck 5: The Monolith (~significant scale, multiple teams)

**What breaks:** Not a technical bottleneck initially — an organisational one.
When different teams need to own different modules independently, or when
modules have genuinely different scaling profiles (the insight engine needs more
CPU than the API), the monolith becomes a constraint.

**This is the last bottleneck, not the first.** Most systems are over-distributed
before they need to be.

**Fix — Selective Extraction**
The modular monolith is designed for surgical extraction:

**First extraction:** Workers are already separate processes (SQS consumers).
Nothing changes architecturally — they just get their own ECS service and
can be deployed and scaled independently.

**Second extraction (if needed):** The insight engine, if it becomes CPU-intensive
due to complex rules or AI integration in V3, can be extracted as a separate
service. It has no shared in-process state with the API — it reads from the
database and writes to `insight_snapshots`. Clean extraction.

**Third extraction (if needed):** The calendar sync module, if it needs to handle
thousands of concurrent Google API connections, can become a dedicated service.

**What never needs extraction at any reasonable scale:** Auth, goals, finances.
These are low-throughput, relational, and benefit from being co-located with
the database.

---

## Commercial Scaling — The Three Paths

### Path 1: B2C SaaS (Direct to Families)

**Model:** Families sign up directly. Freemium with paid tier.

**Pricing direction:**
- Free: manual data entry, 1 calendar, basic insights
- Pro (£9/month): both calendars, Excel import, full insight engine, weekly digest
- Family+ (£15/month): extended family members, advanced financial analytics

**Unit economics at scale:**

| Families | MRR (60% on Pro) | Infrastructure Cost | Margin |
|---|---|---|---|
| 100 | £540 | ~£80 | 85% |
| 1,000 | £5,400 | ~£300 | 94% |
| 10,000 | £54,000 | ~£1,500 | 97% |

SaaS margins are high because infrastructure cost grows sub-linearly with users.

**Primary scaling concern:** Customer acquisition, not infrastructure.
A B2C finance app requires significant trust-building and marketing investment.
The technical architecture is the easy part.

**GDPR / compliance requirements:**
- Right to deletion: `DELETE CASCADE` is already on all models — deleting a
  family cascades to all their data
- Data export: build a `GET /families/export` endpoint that returns all family
  data as JSON
- Consent management: track marketing consent separately from service consent
- Data residency: if targeting EU families, ensure RDS is in eu-west regions

---

### Path 2: White-Label PaaS (Weave for Organisations)

**Model:** Organisations (banks, schools, employers) license Weave to offer to
their customers or employees under their own brand.

**Why this is the higher-ceiling path:**
- B2C: charge one family £9/month
- PaaS: charge one bank £3/family/month × 50,000 families = £150,000/month
  from a single customer

**Architecture change required — Two-Level Tenancy:**

```
Current schema:              PaaS schema:
Family = root tenant         Organisation = root tenant
                             └── Family = sub-tenant
```

```prisma
model Organisation {
  id          String      @id @default(uuid())
  name        String
  slug        String      @unique  // used in white-label URLs
  plan        OrgPlan
  brandingJson Json?               // logo, colours, custom domain
  featureFlags Json?               // which features this org has enabled
  createdAt   DateTime    @default(now())

  families    Family[]
  apiKeys     ApiKey[]
}

model Family {
  id             String  @id @default(uuid())
  organisationId String? // null = direct B2C, set = PaaS customer
  name           String
  // ... rest unchanged
}

model ApiKey {
  id             String   @id @default(uuid())
  organisationId String
  keyHash        String   @unique  // store hash, never plaintext
  name           String            // "Production", "Staging"
  lastUsedAt     DateTime?
  createdAt      DateTime @default(now())
}
```

**What the organisationId migration looks like:**
The `organisationId` field is already nullable in the schema (see ADR-09).
When activating PaaS mode:
1. Create an `Organisation` record for each B2C cohort (or a default "Direct"
   organisation)
2. Backfill `organisationId` on all existing families
3. Make `organisationId` non-nullable
4. Add organisation-level RLS policies

This is a planned migration, not an emergency refactor.

**New capabilities required for PaaS:**
- **API key authentication** alongside JWT — organisations integrate
  programmatically
- **Webhook delivery** — organisations subscribe to family events
  (checkin completed, insight triggered, expense added)
- **White-label theming** — organisation-level branding applied at render time
- **Feature flags** — per-organisation feature enablement
- **Usage metering** — count active families per organisation per billing period
  for usage-based billing
- **Dedicated infrastructure option** — large enterprise customers may require
  single-tenant deployment for compliance reasons

**Webhook architecture:**

```
Data change in Weave
       ↓
Event published to SQS (existing)
       ↓
Webhook delivery worker (new)
       ↓
HTTP POST to organisation's endpoint
       ↓
Retry with exponential backoff on failure
       ↓
Dead-letter after 5 failures → alert organisation
```

---

### Path 3: API-First Platform

**Model:** Expose Weave's core capabilities (insight engine, goal tracking,
expense analysis) as a public API. Developers build products on top of it.

**What the API surface looks like:**

```
POST /v1/insights/analyse
Body: { expenses[], goals[], calendarEvents[] }
Returns: InsightSnapshot[]

POST /v1/goals
GET  /v1/goals
POST /v1/goals/:id/checkins

POST /v1/expenses
GET  /v1/expenses/summary?period=quarterly
```

**New infrastructure required:**
- API versioning (`/v1/`, `/v2/`) with version negotiation
- Per-key rate limiting (different tiers get different rate limits)
- Public developer documentation (Mintlify already set up)
- Sandbox environment with pre-seeded test data
- API key rotation and revocation

**Revenue model:** Tiered by API call volume.
- Starter: 10,000 calls/month free
- Growth: £49/month for 500,000 calls
- Scale: custom pricing

---

## Infrastructure Scaling Roadmap

### Now (V1) — Single family, portfolio deployment
```
Vercel (Next.js) + EC2 t3.micro (API) + RDS t3.micro + Upstash Redis + SQS
~£25-50/month
```

### Stage 2 — Early commercial (100-1,000 families)
```
Vercel + ECS Fargate (API, auto-scaling 1-3 instances)
RDS t3.medium + RDS Proxy
ElastiCache t3.micro
SQS + ECS workers (auto-scaling 1-5 instances)
CloudFront + WAF
~£200-400/month
```

### Stage 3 — Growth (1,000-10,000 families)
```
Vercel + ECS Fargate (API, auto-scaling 2-10 instances)
RDS t3.large (primary) + RDS Read Replica
PgBouncer or RDS Proxy
ElastiCache cluster mode
SQS + ECS workers (auto-scaling 2-20 instances)
CloudFront + WAF + Shield Standard
Route 53 health checks + failover
~£800-2,000/month
```

### Stage 4 — Scale (10,000+ families / PaaS)
```
Multi-AZ RDS with automated failover
Aurora PostgreSQL (better auto-scaling than RDS)
ElastiCache Multi-AZ
ECS Fargate with Spot instances for workers (60-70% cost reduction)
Dedicated infrastructure option for enterprise org customers
CDN with edge caching for white-label deployments
DataDog or New Relic for observability at scale
~£5,000-15,000/month (offset by significant MRR)
```

---

## What To Do Now (V1 Decisions That Enable Future Scale)

These are low-cost decisions now that avoid expensive migrations later:

| Decision | Cost Now | Value Later |
|---|---|---|
| `organisationId` nullable on Family | 1 field | Enables PaaS without schema migration |
| `@@map()` consistent table names | Convention | Clean SQL when writing raw migrations |
| `Decimal` for money | Type choice | No floating point bugs at scale |
| `onDelete: Cascade` on all relations | Schema discipline | Clean tenant deletion for GDPR |
| Append-only `ExpenseEvent` log | Extra table | Full audit trail for compliance |
| Idempotent SQS workers | Code discipline | Safe horizontal scaling |
| RLS at DB layer | Extra config | Second line of defence at any scale |
| `syncFailureCount` on CalendarAccount | Extra field | Proactive error surfacing at scale |
| `resolvedAt` on InsightSnapshot | Extra field | Prevents insight accumulation at scale |

---

## The One-Sentence Answer

Weave scales as a **multi-tenant SaaS platform** that can evolve into a
**white-label PaaS** by activating a pre-planned two-level tenancy model —
the architecture is already pointed in that direction.

---

## Further Reading

- ADR-01: Modular Monolith — why it's the right starting point
- ADR-07: Row-Level Security — the foundation of tenant isolation at scale
- ADR-09: Schema Design for Future Multi-Tenancy — the organisationId decision
- ARCHITECTURE_DECISIONS.md — all technical decisions and their migration triggers
