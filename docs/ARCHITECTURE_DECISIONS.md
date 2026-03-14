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
Build weave-api as a single deployable FastAPI application with clearly bounded
internal modules (auth, goals, finances, calendar, insights) rather than separate
microservices.

### Context
Weave is a new product with one developer and an unproven architecture. The
system needs to be deployable, debuggable, and changeable quickly. The domain
boundaries are understood at a high level but will likely shift as we learn from
real usage.

### Alternatives Considered

**Microservices from day one**
Each module as a separate deployed service with its own database. Pros:
independent deployability, technology flexibility per service, clear ownership
boundaries. Cons: massive operational overhead (service discovery, distributed
tracing, network failures between services, multiple CI/CD pipelines), premature
boundary solidification before the domain is understood, complexity that slows
down a single developer significantly.

**Serverless functions (AWS Lambda)**
Each endpoint as a Lambda function. Pros: zero server management, scales to zero
cost when idle. Cons: Python cold start latency on a dashboard app is
unacceptable without provisioned concurrency (which eliminates the cost benefit),
async SQLAlchemy connection pooling is problematic with Lambda's ephemeral
execution model, local development with SAM or Localstack is painful.

### Decision Rationale
A modular monolith gives the benefits of clear code boundaries without the
operational overhead of distribution. Module boundaries are enforced by code
convention — no cross-module repository calls, only cross-module service calls —
rather than network boundaries. If a boundary turns out to be wrong, it costs a
refactor, not a redeployment strategy and inter-service contract renegotiation.

The monolith can be extracted into services later if genuine scaling or team
ownership reasons emerge. Starting with microservices and consolidating is much
harder.

### Consequences
- Single Docker image to build, test, and deploy
- All modules share the same async SQLAlchemy session pool
- A bug in one module can theoretically affect others — mitigated by module
  isolation conventions and test coverage
- Scaling is coarse-grained (scale the whole API) — acceptable at portfolio scale
- Workers are already separate processes (SQS consumers) — this is the natural
  first extraction point if independent scaling is needed

### Migration Trigger
If any of these become true, revisit this decision:
- The insights engine requires significantly more compute than the API
- A second engineering team needs to own a module independently
- A module needs a different technology stack

---

## ADR-02: Two Separate Repositories Over Monorepo

**Date:** 2026-03-09
**Status:** accepted

### Decision
Maintain weave-web and weave-api as two separate GitHub repositories rather than
a monorepo.

### Context
The frontend (Next.js) and backend (FastAPI) are separate deployable units with
different deployment targets, different CI/CD pipelines, and different dependency
lifecycles. The two codebases use different languages — Python and TypeScript —
making a monorepo tooling choice inherently awkward.

### Alternatives Considered

**Python + TypeScript monorepo**
Both in one repo. Pros: single place for all code, atomic commits across
frontend and backend. Cons: no standard monorepo tool handles Python + TypeScript
well together; `pyproject.toml` and `package.json` do not compose; CI pipelines
become complex and slow. The shared surface area does not justify the tooling overhead.

**Python-only frontend (HTMX or Django templates)**
Keep everything in Python. Pros: one language, one repo, simpler stack. Cons:
the job market for senior roles strongly favours React/Next.js on the frontend.
A Python backend with a Next.js frontend is the more commercially relevant
portfolio choice.

### Decision Rationale
Two clean repos are easier to clone, review, and understand independently. An
interviewer can focus on the Python backend architecture without navigating
frontend code.

The only shared concern is API response shapes. This is handled by keeping
Pydantic response schemas as the source of truth in the API — the frontend
TypeScript types mirror them.

### Consequences
- Two CI/CD pipelines to maintain — each is simpler for being independent
- Cross-cutting changes require two PRs — acceptable at this team size
- Pydantic schemas in weave-api are the authoritative API contract definition

### Migration Trigger
If a mobile app is added in V2, reassess. A more formal API contract tool
(OpenAPI schema export, shared client generation) becomes valuable.

---

## ADR-03: Async SQLAlchemy 2.0 Over Synchronous ORM

**Date:** 2026-03-09
**Status:** accepted

### Decision
Use SQLAlchemy 2.0 with the async engine and `asyncpg` driver for all database
access rather than synchronous SQLAlchemy, Django ORM, or a simpler async library.

### Context
Weave is built on FastAPI, which is an async-native framework. The application
has background jobs that make external API calls (Google Calendar) concurrently
with database queries. The database layer must not block the event loop.

### Alternatives Considered

**Synchronous SQLAlchemy with threadpool**
Use classic synchronous SQLAlchemy with FastAPI's threadpool executor. Pros:
more documentation, simpler mental model. Cons: each database query blocks a
thread; threadpool exhaustion under load; anti-pattern for a FastAPI application.

**Tortoise ORM**
Async-native ORM built for asyncio. Pros: simpler async API, good FastAPI
integration. Cons: smaller ecosystem, less employer familiarity, migration tooling
less mature than Alembic.

**Databases library (encode/databases)**
Thin async query layer over raw SQL. Pros: simple, async-native. Cons: no ORM
features, no migration tool, significant boilerplate.

**Piccolo ORM**
Async ORM with its own migration tool. Pros: clean async API, opinionated.
Cons: niche adoption, limited community resources.

### Decision Rationale
SQLAlchemy 2.0's async support is production-grade and widely used. The 2.0
API — `select()`, `Mapped[]`, `mapped_column()` — is significantly cleaner than
the legacy 1.x API. Combined with Alembic for migrations, this is the stack
most senior Python backend teams use when building on FastAPI.

The `asyncpg` driver is the fastest PostgreSQL driver available for Python —
written in Cython/C, it significantly outperforms `psycopg2` on async workloads.

Using the async engine means database queries never block the event loop,
enabling FastAPI to handle other requests while a query executes.

### Consequences
- All database session management uses `async with AsyncSession()` context managers
- FastAPI dependency injection (`Depends(get_db)`) provides session scoping per request
- SQLAlchemy models use the `Mapped[T]` type annotation syntax — fully typed,
  compatible with mypy strict mode
- Alembic migration files are plain Python — reviewable and version-controlled
- `asyncpg` does not support `psycopg2`-style parameterisation — use SQLAlchemy
  parameter binding, never string interpolation

---

## ADR-04: Local Calendar Cache Over Live Google Calendar API Calls

**Date:** 2026-03-09
**Status:** accepted

### Decision
Sync Google Calendar events into a local `calendar_events` table every 15 minutes
via an async background worker, and serve the calendar view from the local cache
rather than calling the Google Calendar API on each page request.

### Context
The calendar view is loaded on every dashboard visit and needs to show events from
both partners' calendars. The insight engine also needs calendar data to run
conflict detection rules. Both require fast, reliable access to calendar data.

### Alternatives Considered

**Live API calls on every request**
Call Google Calendar API directly on page load. Pros: always up to date, simpler
code. Cons: rate limits, added latency on every load, calendar view completely
breaks if Google's API is unavailable.

**User-triggered refresh**
Only sync when the user explicitly refreshes. Pros: no background job complexity.
Cons: data is stale by default, the insight engine cannot run on fresh data
automatically.

### Decision Rationale
Serving the calendar view from a local PostgreSQL query (with an index on
`family_id + start_time`) is an order of magnitude faster than an external API
call. The 15-minute sync lag is acceptable for a weekly planning tool.

Decoupling the insight engine from live API calls means insights can be
recalculated reliably without worrying about API rate limits or availability.

The sync worker uses an idempotent upsert on `UNIQUE(calendar_account_id, external_id)` —
safe to run multiple times without creating duplicates.

### Consequences
- Calendar data can be up to 15 minutes stale — shown in the UI with a "last synced" timestamp
- The background worker handles Google OAuth token refresh transparently
- Sync failure tracking triggers a reconnection insight after 3 consecutive failures
- Deleted Google Calendar events are soft-deleted (`deleted_at`) on next sync

### Migration Trigger
If V2 introduces calendar write-back, the sync strategy needs to become
bidirectional. Google Calendar push notifications (webhooks replacing polling)
are the correct long-term architecture and are documented as a V2 improvement.

---

## ADR-05: Rule-Based Insight Engine Over AI/ML

**Date:** 2026-03-09
**Status:** accepted

### Decision
Implement the insight engine as a set of deterministic, rule-based async functions
rather than using an LLM or ML model to generate insights.

### Context
The insight engine surfaces actionable observations by joining data across goals,
expenses, and calendar events. The quality and trustworthiness of insights
directly affects whether users act on them, especially for financial decisions.

### Alternatives Considered

**LLM-generated insights**
Prompt an LLM with the family's data and ask it to generate insights. Pros:
can surface nuanced patterns, natural language output. Cons: non-deterministic,
expensive at scale, hard to test, financial suggestions from an ungrounded LLM
are a trust liability.

**ML anomaly detection**
Train a model on spending patterns. Pros: can learn user-specific baselines.
Cons: requires significant historical data, overkill for V1, introduces
model training infrastructure.

### Decision Rationale
The insights Weave needs in V1 are deterministic questions:
- Does this goal have a calendar block? (yes/no)
- Has there been a check-in in the last 21 days? (yes/no)
- Is category spend up vs last quarter? (calculate and compare)
- Are there subscriptions renewing this month? (filter by `next_due_date`)

Rule-based insights are testable, explainable, deterministic, and free.
AI-generated insights are planned for V3 — after rule-based insights have been
validated with real users.

### Consequences
- Each insight rule is an independent async function — easy to add or modify
- Insight messages are formatted strings filled with real data — always accurate
- The `metadata` JSON field stores rule-specific context for rich UI cards

### Migration Trigger
V3: add an AI layer that surfaces patterns too complex to hardcode. AI insights
will be clearly labelled as "suggestions" rather than "alerts".

---

## ADR-06: Client-Side Excel Parsing Over Server-Side

**Date:** 2026-03-09
**Status:** accepted

### Decision
Parse uploaded Excel files in the browser using SheetJS before sending data to
the API, rather than uploading the raw file to the Python backend for processing.

### Context
Users want to import existing household expense spreadsheets. The spreadsheets
contain sensitive financial information. Column structure varies between users.

### Alternatives Considered

**Server-side parsing with Python**
Upload the raw file to S3, process it with `openpyxl` or `pandas` in a background
task. Pros: consistent parsing environment. Cons: raw financial data transits to
and is stored on the server, slower feedback loop, requires S3 infrastructure.

**CSV export requirement**
Ask users to export as CSV before uploading. Pros: simpler parsing. Cons: adds
friction, many users do not know how to export CSV from Excel.

### Decision Rationale
Client-side parsing keeps raw financial data on the user's device. The server only
ever receives validated, structured JSON — never the raw file. Parsing is instant
in the browser, the column mapping UI appears immediately, and users can correct
mappings before any data is sent.

### Consequences
- Large files may slow the browser — acceptable as household sheets are typically
  under 500 rows
- The API receives clean JSON matching the Pydantic schema — no file parsing on
  the Python side
- Pydantic validation on incoming rows is the last line of defence

---

## ADR-07: Row-Level Security at the Database Layer for Tenant Isolation

**Date:** 2026-03-09
**Status:** accepted

### Decision
Enforce family (tenant) data isolation using PostgreSQL Row-Level Security (RLS)
policies in addition to application-layer filtering.

### Context
Weave is multi-tenant. Each family's data must be completely invisible to other
families. A bug in the application layer must not result in data leakage.

### Alternatives Considered

**Application-layer filtering only**
Every query includes `WHERE family_id = ?`. Pros: simpler. Cons: a single missed
filter clause leaks all data — no defence in depth.

**Separate database per tenant**
Strongest possible isolation. Cons: impractical at scale, Alembic migrations
must run N times per tenant.

### Decision Rationale
RLS adds a second enforcement layer in the database. Even if the application
layer omits a `family_id` filter, the database returns zero rows. The `get_db`
dependency sets the PostgreSQL session variable `app.family_id` after JWT
verification. RLS policies reference this variable:

```sql
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY family_isolation ON goals
  USING (family_id = current_setting('app.family_id')::uuid);
```

This pattern is used in production by companies like Supabase.

### Consequences
- Every database session must set `app.family_id` — enforced in the `get_db` dependency
- RLS policies are written as raw SQL in Alembic migrations
- The application database role must NOT be a superuser — superusers bypass RLS
- Test setup must set the session variable

---

## ADR-08: Decimal Type for Monetary Values

**Date:** 2026-03-09
**Status:** accepted

### Decision
Store all monetary amounts as `NUMERIC(12, 2)` in PostgreSQL, mapped to Python's
`Decimal` type via SQLAlchemy. Never use `float` for money.

### Why This Matters
IEEE 754 floating point cannot represent most decimal fractions exactly:

```python
>>> 0.1 + 0.2 == 0.3
False
>>> 0.1 + 0.2
0.30000000000000004
```

`£9.99 × 12` can compute as `£119.87999999...` with float arithmetic.

### Decision Rationale
`NUMERIC(12, 2)` stores values as exact decimal numbers. Python's `Decimal`
from the `decimal` module maintains precision through arithmetic. `12, 2`
supports values up to £9,999,999,999.99 — sufficient for household finances.

### Consequences
- Pydantic schemas use `Decimal` for amount fields, not `float`
- JSON serialisation requires explicit conversion: `str(amount)`
- FastAPI's JSON encoder must be configured to handle `Decimal`
- SQLAlchemy column type: `Numeric(precision=12, scale=2, asdecimal=True)`

---

## ADR-09: Pydantic v2 and Pydantic Settings for Validation and Configuration

**Date:** 2026-03-09
**Status:** accepted

### Decision
Use Pydantic v2 for all request/response validation and Pydantic Settings for
environment variable validation. Fail fast on startup if any required variable
is missing.

### Alternatives Considered

**marshmallow + python-decouple**
Separate best-of-breed libraries. Cons: two different validation paradigms,
no shared type inference between request validation and config.

**attrs + cattrs**
High-performance alternative. Cons: less FastAPI integration, less ecosystem
adoption.

### Decision Rationale
Pydantic v2 is the de facto standard for FastAPI applications. FastAPI uses
Pydantic internally for request parsing and OpenAPI schema generation. Pydantic
v2 (released 2023) is 5-50x faster than v1 and has a cleaner API.

Pydantic Settings validates environment variables against the same `BaseModel`
schema. The application will not start if a required variable is missing — the
correct behaviour.

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_public_key: str
    encryption_key: str
    redis_url: str
    aws_region: str = "eu-west-2"
    environment: str = "development"

    model_config = {"env_file": ".env", "case_sensitive": False}

settings = Settings()  # raises ValidationError on startup if vars missing
```

### Consequences
- All request schemas inherit from `pydantic.BaseModel`
- Response schemas use `model_config = {"from_attributes": True}` for
  SQLAlchemy model → Pydantic conversion
- Mypy strict mode works with Pydantic v2 via the `pydantic` mypy plugin

---

## ADR-10: Result Type Pattern for Service Layer Error Handling

**Date:** 2026-03-09
**Status:** accepted

### Decision
Use a `Result[T, E]` type for all service layer functions rather than raising
exceptions across module boundaries.

### Context
Python's default error handling relies on exceptions that can propagate silently
across any boundary. In a layered architecture (router → service → repository),
an unhandled exception can surface as an unformatted 500 error at the API layer.
Error paths are implicit and hard to test.

### Alternatives Considered

**Bare exceptions throughout**
Raise domain exceptions in the repository, catch in the router. Cons: exception
propagation is invisible to the type system — mypy cannot verify that callers
handle all error cases.

**Optional[T] return types**
Return `None` on failure. Cons: loses error information — the caller cannot
distinguish "not found" from "forbidden" from "conflict".

### Decision Rationale
The `Result[T, E]` pattern makes error paths explicit and type-checkable.
A service function returning `Result[GoalResponse, AppError]` communicates
its failure modes in its signature. Python 3.12's `type` statement makes this
clean:

```python
# app/shared/result.py
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")
E = TypeVar("E", bound="AppError")

@dataclass(frozen=True)
class Ok(Generic[T]):
    value: T
    ok: bool = True

@dataclass(frozen=True)
class Err(Generic[E]):
    error: E
    ok: bool = False

type Result[T, E] = Ok[T] | Err[E]
```

Usage in a service:
```python
async def get_goal(
    goal_id: UUID,
    family_id: UUID,
    db: AsyncSession,
) -> Result[GoalResponse, AppError]:
    goal = await goal_repository.find_by_id(goal_id, family_id, db)
    if goal is None:
        return Err(NotFoundError("goal", str(goal_id)))
    return Ok(GoalResponse.model_validate(goal))
```

### Consequences
- Service functions never raise exceptions — they return `Err` values
- Routers are the only layer that converts `AppError` to HTTP exceptions
- Every service function's failure modes are visible in its return type
- Tests assert on `result.ok`, `result.value`, and `result.error` without
  catching exceptions

---

## ADR-11: Ruff for Linting and Formatting

**Date:** 2026-03-09
**Status:** accepted

### Decision
Use Ruff as the single linting and formatting tool, replacing the combination of
flake8, black, isort, and pylint.

### Decision Rationale
Ruff is written in Rust and is 10-100x faster than the Python tools it replaces.
It implements rules from flake8, black, isort, pylint, and dozens of other linters
in a single binary with a single configuration file (`pyproject.toml`).

Ruff is now the dominant Python linting tool in new projects (2024/2026) and is
used by FastAPI, Pydantic, and major Python projects. One tool, one config,
one CI step — simpler and faster than the traditional combination.

```toml
[tool.ruff.lint]
select = [
    "E",      # pycodestyle errors
    "F",      # pyflakes
    "I",      # isort
    "N",      # pep8-naming
    "UP",     # pyupgrade
    "ASYNC",  # flake8-async — catches common async mistakes
    "B",      # bugbear — opinionated correctness rules
]
```

### Consequences
- `ruff check .` replaces flake8 + isort + pylint
- `ruff format .` replaces black
- Pre-commit hooks run one tool instead of four
- `ASYNC` rules catch common async/await mistakes that static analysis often misses

---

## ADR-12: Nullable `organisation_id` on Family for Future Multi-Tenancy

**Date:** 2026-03-09
**Status:** accepted

### Decision
Add a nullable `organisation_id` column to the `families` table now, even though
V1 has no Organisation concept. `NULL` means a direct B2C family. A populated
value means the family belongs to a PaaS customer's organisation.

### Context
Weave's commercial scaling analysis (see SCALING.md) identifies a white-label
PaaS model as the highest-ceiling commercial path. This requires a two-level
tenancy model: Organisation → Family. The question is when to add this.

### Decision Rationale
One nullable column added to one table. No application logic changes. `NULL` is
semantically correct for "direct B2C family" and requires no migration of
existing rows.

When PaaS activation is needed:
1. Create the `organisations` table via Alembic migration
2. Make `organisation_id` non-nullable in a follow-up migration
3. Add organisation-level RLS policies
4. Update JWT payload to include `organisation_id`

This is a one-afternoon migration rather than a multi-day schema surgery.

### Consequences
- `organisation_id` is always `None` in V1 — SQLAlchemy model uses `Optional[UUID]`
- Mypy enforces `None` checks everywhere the field is accessed
- V1 queries filter by `family_id` — `organisation_id` is not part of the V1 query pattern

### Migration Trigger
- A commercial organisation expresses interest in licensing Weave
- The decision is made to pursue the PaaS commercial path

---

## ADR-13: Jurisdiction-Aware Tax Rule Registry and Privacy-by-Design in TaxProfile

**Date:** 2026-03-09
**Status:** accepted

### Decision
Implement the tax insight engine (V2) as a jurisdiction-aware, annually-versioned
rule registry. Store only income brackets in `TaxProfile`, never exact salary
figures.

### Decision 1: Rule Registry Pattern

Each tax rule is a self-contained, independently testable async function scoped
to a specific country and tax year:

```python
# app/modules/tax/rules/base.py
from typing import Protocol

class TaxInsightRule(Protocol):
    rule_id: str
    jurisdiction: str       # 'DE', 'FR', 'NL'
    tax_year: int           # 2024, 2025, 2026
    sources: list[str]      # official source URLs — always cited
    disclaimer: str         # legal disclaimer — always shown

    async def check(self, context: TaxContext) -> TaxInsight | None: ...
```

Adding Germany 2026 rules means adding new rule objects — no existing code
changes. Adding France means adding French rule objects — German rules untouched.
This is the Open/Closed Principle applied at a product level.

### Decision 2: Income Brackets Over Exact Salary

Every V2 tax insight works at bracket-level accuracy:

| Insight | Exact income needed? | Bracket sufficient? |
|---|---|---|
| Kinderfreibetrag vs Kindergeld | No — threshold ~€70k | Yes |
| Günstigerprüfung eligibility | No — threshold 25% rate | Yes |
| Riester allowance | No — fixed per child | Yes |
| Rürup deduction limit | No — fixed annual maximum | Yes |
| Homeoffice-Pauschale | No — based on days, not income | Yes |

### The Legal Boundary This Architecture Enforces

`sources` and `disclaimer` are required fields on `TaxInsightRule`, enforced by
the `Protocol` type — a class that omits them will fail mypy's structural type
check. Every tax insight always cites an official source and always carries a
disclaimer. This cannot be accidentally omitted.

### Consequences
- Tax rules are versioned alongside the codebase — changes are reviewed in PRs
- Annual rule updates create new rule objects, never modify existing ones
- `TaxProfile` is lower risk in a data breach than if it held exact salaries
- GDPR data minimisation principle is demonstrably applied
- Some insights are directional rather than precise — correct for a non-regulated tool

### Migration Trigger
- When a second EU jurisdiction is requested: add that country's rule objects
  and update `TaxProfile` if jurisdiction-specific fields are needed
- If Weave ever seeks BaFin authorisation: revisit with legal counsel

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
- Changing the database schema in a non-trivial way
- Adding or removing a dependency that affects architecture
- Changing the deployment strategy
- Deciding NOT to do something that could reasonably be expected

**What does not need an ADR:**
- Dependency version bumps
- Naming conventions (these live in `.cursor/rules`)
- Bug fixes
- UI styling decisions