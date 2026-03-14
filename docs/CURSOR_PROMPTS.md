# Weave — Cursor Prompt Sequence

> Stack: FastAPI + Python 3.12 + SQLAlchemy 2.0 async + Alembic + Pydantic v2
> Run prompts in order. Never skip a step. Verify before moving on.

**Verification after every prompt:**
```bash
mypy app/                    # must pass with zero errors
ruff check app/ tests/       # must pass with zero warnings
pytest                       # must pass with zero failures
```

If any fail — fix before the next prompt. Do not build on a broken foundation.

---

## Prompt 0 — Repository Scaffold

**When:** Day 1, after cleaning the repo and dropping your docs in.
**Verify:** `python -c "from app.main import create_app; print('OK')"` passes.
`make check` passes. `make test` runs with zero errors.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

You are helping me build the Weave API — a FastAPI + Python 3.12 backend
for a family life operating system. Read both documents fully before doing
anything. Every decision in those documents is final — do not suggest
alternative approaches or libraries.

Your task is to scaffold the complete repository structure.

FOLDER STRUCTURE:
app/
  modules/
    auth/
      __init__.py
      router.py
      service.py
      repository.py
      schemas.py
      dependencies.py
    family/    (same structure as auth)
    goals/     (same structure as auth)
    finances/  (same structure as auth)
    calendar/  (same structure as auth)
    insights/
      __init__.py
      router.py
      service.py
      repository.py
      schemas.py
      dependencies.py
      rules/
        __init__.py
        base.py
        unblocked_commitments.py
        goal_neglect.py
        category_spend.py
        subscription_renewal.py
        budget_pressure.py
    tax/
      __init__.py
      router.py
      service.py
      repository.py
      schemas.py
      dependencies.py
      rules/
        __init__.py
        base.py
        registry.py
  shared/
    db/
      __init__.py
      base.py
      mixins.py
      session.py
    middleware/
      __init__.py
      authenticate.py
      tenant.py
    jobs/
      __init__.py
      calendar_sync.py
      weekly_digest.py
      insight_recalc.py
      tax_deadline_seeder.py
    events/
      __init__.py
      publisher.py
      event_types.py
    errors/
      __init__.py
    encryption.py
    result.py
  models/
    __init__.py
    family.py
    user.py
    goal.py
    expense.py
    calendar.py
    insight.py
    tax.py
  config.py
  main.py
alembic/
  versions/
  env.py
  script.py.mako
tests/
  __init__.py
  conftest.py
  modules/
    __init__.py
    test_auth.py
    test_family.py
    test_goals.py
    test_finances.py
    test_calendar.py
    test_insights.py
  shared/
    __init__.py
    test_result.py
    test_encryption.py
    test_errors.py
docs/
  adr/
  PRODUCT_BRIEF.md      (already exists — do not overwrite)
  ARCHITECTURE_DECISIONS.md  (already exists — do not overwrite)
  SCALING.md            (already exists — do not overwrite)
.cursor/
  rules                 (already exists — do not overwrite)
.github/
  workflows/
    ci.yml
.env.example
.gitignore
Dockerfile
docker-compose.yml
pyproject.toml
alembic.ini
mypy.ini
sonar-project.properties  (already exists — do not overwrite)
.coderabbit.yaml           (already exists — do not overwrite)
.pre-commit-config.yaml
Makefile
README.md

FILES TO GENERATE WITH REAL CONTENT:

1. pyproject.toml
   [project]
   name = "weave-api"
   version = "0.1.0"
   requires-python = ">=3.12"
   dependencies = [
     "fastapi>=0.110.0",
     "uvicorn[standard]>=0.27.0",
     "sqlalchemy[asyncio]>=2.0.0",
     "alembic>=1.13.0",
     "asyncpg>=0.29.0",
     "pydantic>=2.6.0",
     "pydantic-settings>=2.2.0",
     "python-jose[cryptography]>=3.3.0",
     "passlib[bcrypt]>=1.7.4",
     "aioredis>=2.0.0",
     "boto3>=1.34.0",
     "aiobotocore>=2.12.0",
     "httpx>=0.27.0",
     "sentry-sdk[fastapi]>=1.40.0",
     "cryptography>=42.0.0",
   ]
   [project.optional-dependencies]
   dev = [
     "pytest>=8.0.0",
     "pytest-asyncio>=0.23.0",
     "pytest-cov>=4.1.0",
     "pytest-mock>=3.12.0",
     "anyio>=4.3.0",
     "ruff>=0.3.0",
     "mypy>=1.8.0",
     "pre-commit>=3.6.0",
     "types-passlib",
     "types-python-jose",
   ]
   [tool.ruff]
   line-length = 90
   target-version = "py312"
   [tool.ruff.lint]
   select = ["E", "F", "I", "N", "W", "UP", "ASYNC", "B"]
   [tool.ruff.format]
   quote-style = "double"
   [tool.mypy]
   python_version = "3.12"
   strict = true
   plugins = ["pydantic.mypy", "sqlalchemy.ext.mypy.plugin"]
   [tool.pytest.ini_options]
   asyncio_mode = "auto"
   testpaths = ["tests"]
   addopts = "--cov=app --cov-report=term-missing --cov-report=xml"

2. .env.example — all variables needed:
   DATABASE_URL=postgresql+asyncpg://username@localhost:5432/weave_dev
   JWT_SECRET="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
   JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
   JWT_ACCESS_EXPIRY_MINUTES=15
   JWT_REFRESH_EXPIRY_DAYS=30
   ENCRYPTION_KEY=change-me-generate-with-openssl-rand-hex-32
   REDIS_URL=rediss://your-upstash-url
   AWS_REGION=eu-west-2
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   SQS_CALENDAR_SYNC_URL=https://sqs.eu-west-2.amazonaws.com/...
   SQS_INSIGHT_RECALC_URL=https://sqs.eu-west-2.amazonaws.com/...
   SQS_WEEKLY_DIGEST_URL=https://sqs.eu-west-2.amazonaws.com/...
   SQS_TAX_DEADLINE_URL=https://sqs.eu-west-2.amazonaws.com/...
   SES_FROM_EMAIL=digest@weave.app
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/calendar/oauth/callback
   SENTRY_DSN=your-sentry-dsn
   PORT=8000
   ENVIRONMENT=development

3. .gitignore — Python standard:
   __pycache__/, *.pyc, *.pyo, .Python, *.egg-info/, dist/, build/,
   .venv/, venv/, env/, .env, *.env.local,
   private.pem, public.pem,
   .pytest_cache/, .coverage, coverage.xml, htmlcov/,
   .mypy_cache/, .ruff_cache/, .DS_Store, .idea/

4. .pre-commit-config.yaml:
   repos:
     - repo: https://github.com/astral-sh/ruff-pre-commit
       rev: v0.3.0
       hooks:
         - id: ruff
           args: [--fix]
         - id: ruff-format
     - repo: https://github.com/pre-commit/mirrors-mypy
       rev: v1.8.0
       hooks:
         - id: mypy
           additional_dependencies:
             - pydantic>=2.6.0
             - sqlalchemy>=2.0.0
             - types-passlib
             - types-python-jose
     - repo: https://github.com/pre-commit/pre-commit-hooks
       rev: v4.5.0
       hooks:
         - id: trailing-whitespace
         - id: end-of-file-fixer
         - id: check-yaml
         - id: check-toml
         - id: check-merge-conflict
         - id: debug-statements

5. Makefile — with these targets:
   install: pip install -e ".[dev]" && pre-commit install
   dev: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   lint: ruff check app/ tests/
   lint-fix: ruff check --fix app/ tests/
   format: ruff format app/ tests/
   typecheck: mypy app/
   check: lint + typecheck (run both, print "All checks passed" on success)
   test: pytest
   test-cov: pytest --cov=app --cov-report=term-missing --cov-report=xml
   test-module: pytest tests/modules/$(module)/
   migrate: alembic upgrade head
   migrate-create: alembic revision --autogenerate -m "$(name)"
   migrate-down: alembic downgrade -1
   migrate-history: alembic history --verbose
   db-reset: alembic downgrade base && alembic upgrade head
   docker-up: docker-compose up -d
   docker-down: docker-compose down
   docker-build: docker-compose build
   docker-logs: docker-compose logs -f weave-api
   worker: python -m app.main --worker
   clean: remove all __pycache__, .mypy_cache, .ruff_cache, .pytest_cache,
          coverage.xml, .coverage
   help: print all targets with one-line descriptions
   All targets declared .PHONY

6. alembic.ini — standard config, sqlalchemy.url left blank (set in env.py)

7. alembic/env.py — async Alembic env that imports all SQLAlchemy models,
   reads DATABASE_URL from environment, uses asyncpg

8. mypy.ini
   [mypy]
   python_version = 3.12
   strict = true
   plugins = pydantic.mypy, sqlalchemy.ext.mypy.plugin

9. Dockerfile — multi-stage: builder → runner
   Python 3.12-slim base, non-root user,
   pip install .[dev] in builder, copy to runner,
   CMD: uvicorn app.main:app --host 0.0.0.0 --port 8000
   HEALTHCHECK on GET /health

10. docker-compose.yml
    weave-api (port 8000, depends on postgres + redis)
    postgres:15-alpine (port 5432, persistent volume)
    redis:7-alpine (port 6379)
    All env vars from .env

11. .github/workflows/ci.yml
    Triggers: push to main, pull_request to main
    Jobs:
      lint: ruff check app/ tests/
      typecheck: mypy app/
      test: pytest --cov with postgres:15 service container
    Python 3.12 throughout

12. README.md
    # Weave API — FastAPI backend for a family life operating system
    Links to docs/PRODUCT_BRIEF.md, docs/adr/, docs/SCALING.md
    ## Development
    make install       — install dependencies and pre-commit hooks
    make docker-up     — start postgres + redis
    make migrate       — apply all migrations
    make dev           — start FastAPI with hot reload on port 8000
    make check         — run lint + typecheck
    make test          — run test suite
    make help          — list all available commands
    ## Tech Stack
    FastAPI, SQLAlchemy 2.0 async, Alembic, Pydantic v2, asyncpg,
    PostgreSQL, Redis (aioredis), AWS SQS + SES, python-jose RS256
    FastAPI, SQLAlchemy 2.0 async, Alembic, Pydantic v2, asyncpg,
    PostgreSQL, Redis (aioredis), AWS SQS + SES, python-jose RS256

ALL MODULE FILES (router.py, service.py, repository.py, schemas.py,
  dependencies.py, rules/*.py, jobs/*.py, events/*.py, middleware/*.py):
  Create as empty scaffolds:
  # TODO: implement [filename] — see docs/PRODUCT_BRIEF.md

ALL MODEL FILES (app/models/*.py):
  Implement fully with SQLAlchemy 2.0 Mapped[T] / mapped_column() syntax.
  Copy the complete schema from docs/PRODUCT_BRIEF.md exactly.
  Use Numeric(12, 2, asdecimal=True) for all monetary fields.
  Use UUID type for all ID fields.
  All models inherit from Base + UUIDMixin + TimestampMixin.
  All enums defined as Python Enum classes.

app/config.py:
  Implement fully — Pydantic BaseSettings validating ALL .env.example vars.
  Fail immediately on startup if any required variable is missing.
  Export a settings singleton.

app/main.py:
  Implement fully — FastAPI app factory create_app().
  Global exception handler for AppError → JSON response.
  Correlation ID middleware on every request.
  GET /health → {"status": "ok", "timestamp": ..., "version": "0.1.0"}
  Sentry integration.
  Lifespan handler for startup validation and graceful shutdown.
  if "--worker" in sys.argv: run all SQS consumers via asyncio.gather.

app/shared/result.py:
  Implement fully — Result[T, E] with Ok, Err, ok(), err() helpers.
  See ADR-10 in ARCHITECTURE_DECISIONS.md for the exact design.

app/shared/errors/__init__.py:
  Implement fully — AppError base with to_http_exception().
  Subclasses: NotFoundError (404), UnauthorisedError (401),
  ForbiddenError (403), ConflictError (409), ValidationError (400),
  InternalError (500).

app/shared/db/base.py:
  Implement fully — async engine, AsyncSessionLocal, declarative Base.

app/shared/db/mixins.py:
  Implement fully — UUIDMixin, TimestampMixin, SoftDeleteMixin.

app/shared/db/session.py:
  Implement fully — get_db() async generator, set_tenant_context().

app/shared/encryption.py:
  Implement fully — AES-256-GCM encrypt/decrypt using cryptography library.
  Random IV per encryption, prepended to ciphertext before base64 encoding.
  Both functions return Result[str, AppError] — never raise.

Every implemented file must be importable with no syntax errors.
Every scaffold must have the TODO comment.
```

---

## Prompt 1 — Shared Infrastructure

**When:** After Prompt 0 verifies cleanly.
**Verify:** `mypy app/shared/` passes. `pytest tests/shared/` passes.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Scaffold is in place. Now implement the shared infrastructure layer fully.
This is the foundation everything else builds on — get it right before
any module is built.

1. app/shared/result.py — if not already implemented by Prompt 0:
   See ADR-10 for the exact design.
   Write 10+ unit tests: Ok, Err, ok(), err(), type narrowing with isinstance.

2. app/shared/errors/__init__.py — if not already implemented:
   Write tests for each error type and to_http_exception().

3. app/config.py — if not already implemented:
   Write tests: valid config loads, missing required var raises ValidationError
   with clear message.

4. app/shared/db/mixins.py — if not already implemented.

5. app/shared/db/base.py — if not already implemented.
   Import ALL models from app/models/ so Alembic can detect them.

6. app/shared/db/session.py
   get_db() async generator:
     - yields AsyncSession
     - sets app.family_id PostgreSQL session variable via set_tenant_context
       after the current_user is available (called from tenant middleware)
   set_tenant_context(session: AsyncSession, family_id: UUID) -> None:
     await session.execute(
       text("SET LOCAL app.family_id = :id"), {"id": str(family_id)}
     )
   Write tests for set_tenant_context.

7. app/shared/encryption.py — if not already implemented:
   encrypt(plaintext: str) -> Result[str, AppError]
     AES-256-GCM, random 12-byte IV, base64 output
   decrypt(ciphertext: str) -> Result[str, AppError]
   Tests: roundtrip, wrong key returns Err, empty string, unicode input.

8. app/shared/events/event_types.py
   EventType enum: EXPENSE_ADDED, EXPENSE_UPDATED, GOAL_UPDATED,
     GOAL_CHECKIN_ADDED, CALENDAR_SYNCED, INSIGHT_RECALC_REQUESTED,
     WEEKLY_DIGEST_REQUESTED, TAX_PROFILE_UPDATED
   SQSEvent dataclass: type: EventType, family_id: UUID, payload: dict,
     timestamp: datetime

9. app/shared/events/publisher.py
   async publish_event(
     event_type: EventType,
     family_id: UUID,
     payload: dict,
     queue_url: str,
   ) -> Result[None, AppError]
   Uses aiobotocore SQS client.
   Never raises — returns Err on any boto exception.
   Structured logging on every publish: {event_type, family_id, queue_url}.
   Tests with mocked aiobotocore client.

10. app/main.py — if not already implemented:
    Global exception handler converts AppError to:
      {"error": {"code": str, "message": str}}
    Correlation ID middleware adds X-Correlation-ID header.
    Sentry init from settings.sentry_dsn.
    Integration test for GET /health.

Follow all conventions in .cursor/rules exactly.
No Any types. Full type annotations on every function.
```

---

## Prompt 2 — Auth Module

**When:** After Prompt 1 verifies cleanly.
**Verify:** `pytest tests/modules/test_auth.py` passes. Test manually with
`curl -X POST http://localhost:8000/auth/signup`.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Shared infrastructure complete. Implement the auth module fully.
Read the Auth Design section of PRODUCT_BRIEF.md carefully before starting.

app/modules/auth/schemas.py:
  SignupRequest: family_name, email, password (min 8 chars), name
  LoginRequest: email, password
  RefreshRequest: refresh_token
  LogoutRequest: token_id
  AuthResponse: access_token, refresh_token, user: UserInAuth
  UserInAuth: id, name, email, role, family_id
  All fields use Field() with description and validation constraints.

app/modules/auth/repository.py:
  find_user_by_email(session, email) -> User | None
  find_user_by_id(session, user_id) -> User | None
  create_family_with_admin(session, family_name, name, email,
    hashed_password) -> tuple[Family, User]   — single transaction
  update_user(session, user_id, **kwargs) -> User

app/modules/auth/service.py:
  signup(session, data: SignupRequest) -> Result[AuthResponse, AppError]
    * ConflictError if email already in use
    * passlib bcrypt hash (rounds=12)
    * Create family + user in single transaction
    * Generate RS256 access token (15 min) and refresh token (30 days)
    * Store refresh in Redis: key=refresh:{user_id}:{token_id}, TTL=30 days
    * Return AuthResponse

  login(session, data: LoginRequest) -> Result[AuthResponse, AppError]
    * UnauthorisedError if user not found or wrong password
    * passlib verify_password
    * Generate new token pair, store refresh in Redis

  refresh(session, refresh_token: str) -> Result[AuthResponse, AppError]
    * Verify RS256 signature with JWT_PUBLIC_KEY
    * Check token exists in Redis — if missing: stolen token detected
      Invalidate all refresh tokens for this user (scan refresh:{user_id}:*)
      Return UnauthorisedError
    * If valid: delete old token, generate new pair, store new refresh token

  logout(user_id: UUID, token_id: str) -> Result[None, AppError]
    * Delete refresh:{user_id}:{token_id} from Redis

  Private helpers:
  _create_access_token(user: User) -> str
    payload: {sub, family_id, role, type: "access", iat, exp}
    signed with JWT_SECRET (RS256)
  _create_refresh_token(user_id: UUID) -> tuple[str, str]
    payload: {sub, jti: uuid4(), type: "refresh", iat, exp}
    returns (token_str, token_id)
    signed with JWT_SECRET (RS256)

app/modules/auth/dependencies.py:
  get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(HTTPBearer()),
    session: AsyncSession = Depends(get_db),
  ) -> User
    * Verify RS256 token with JWT_PUBLIC_KEY using python-jose
    * Return UnauthorisedError if invalid/expired
    * Attach family_id to session via set_tenant_context
  CurrentUser = Annotated[User, Depends(get_current_user)]

  get_current_admin(current_user: CurrentUser) -> User
    * ForbiddenError if role != ADMIN

app/modules/auth/router.py:
  POST /auth/signup → 201 AuthResponse
  POST /auth/login → 200 AuthResponse
  POST /auth/refresh → 200 AuthResponse
  POST /auth/logout → 204 (requires authentication)

tests/modules/test_auth.py:
  signup: success, duplicate email (ConflictError)
  login: success, wrong password, unknown email
  refresh: success, stolen token detection (use token twice → UnauthorisedError),
    expired token, malformed token
  logout: success, already logged out (idempotent)
  get_current_user: valid token, expired token, missing token, malformed
  Mock Redis with pytest-mock. Use pytest-asyncio for all async tests.
  Do not hit real Redis or database in unit tests.

Follow all conventions in .cursor/rules exactly.
```

---

## Prompt 3 — Family Module

**When:** After Prompt 2 verifies cleanly.
**Verify:** `pytest tests/modules/test_family.py` passes.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Auth module complete. Implement the family module.

app/modules/family/schemas.py:
  UpdateFamilyRequest: name
  InviteMemberRequest: email, name, role (default MEMBER)
  FamilyResponse: id, name, members: list[MemberResponse]
  MemberResponse: id, name, email, role, created_at

app/modules/family/repository.py:
  find_family_with_members(session, family_id) -> Family | None
    (eagerly load members relationship)
  update_family(session, family_id, data) -> Family
  find_user_by_email(session, email, family_id) -> User | None
  add_member(session, family_id, name, email, role) -> User
  remove_member(session, family_id, user_id) -> None
  count_admins(session, family_id) -> int

app/modules/family/service.py:
  get_family(session, family_id) -> Result[FamilyResponse, AppError]
  update_family(session, family_id, data, requesting_user) -> Result[FamilyResponse, AppError]
    ForbiddenError if requesting_user.role != ADMIN
  invite_member(session, family_id, data, requesting_user) -> Result[MemberResponse, AppError]
    ForbiddenError if not ADMIN
    ConflictError if email already in family
    Creates user with temporary UUID password — they reset in V2
  remove_member(session, family_id, target_user_id, requesting_user) -> Result[None, AppError]
    ForbiddenError if not ADMIN
    ForbiddenError if removing self and count_admins == 1

app/modules/family/router.py:
  GET /family → FamilyResponse
  PATCH /family → FamilyResponse
  POST /family/members → 201 MemberResponse
  DELETE /family/members/{user_id} → 204

tests/modules/test_family.py:
  get_family: success, not found
  update: success as admin, ForbiddenError as member
  invite: success, duplicate email, non-admin attempt
  remove: success, remove self as only admin (ForbiddenError)

Follow all conventions in .cursor/rules exactly.
```

---

## Prompt 4 — Goals Module

**When:** After Prompt 3 verifies cleanly.
**Verify:** `pytest tests/modules/test_goals.py` passes. Pay special
attention to get_week_start tests — this function is critical.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Family module complete. Implement the goals module.

app/modules/goals/schemas.py:
  CreateGoalRequest: title, category: GoalCategory, target_date (optional),
    requires_time_block: bool, notes (optional), owner_id: UUID
  UpdateGoalRequest: Partial of CreateGoalRequest (all Optional)
  CreateCheckinRequest: status: CheckinStatus, note (optional)
  GoalResponse: full goal + owner_name, latest_checkin_status,
    checkin_streak: int, linked_expense_count: int
  CheckinResponse: id, status, note, checked_in_at, week_start
  GoalListResponse: goals: list[GoalResponse], total: int, active_count: int

app/modules/goals/repository.py:
  list_goals(session, family_id, archived: bool | None, category, owner_id)
    -> list[Goal]
  find_goal(session, goal_id, family_id) -> Goal | None
  create_goal(session, family_id, data) -> Goal
  update_goal(session, goal_id, family_id, data) -> Goal
  archive_goal(session, goal_id, family_id) -> Goal  (sets archived_at = utcnow)
  create_checkin(session, goal_id, user_id, week_start, data) -> GoalCheckin
  find_checkin_for_week(session, goal_id, week_start) -> GoalCheckin | None
  list_checkins(session, goal_id, limit: int = 12) -> list[GoalCheckin]

app/modules/goals/service.py:
  list_goals, get_goal, create_goal, update_goal, archive_goal
  create_checkin(session, goal_id, family_id, user_id, data):
    * Calculate week_start via get_week_start(datetime.utcnow())
    * ConflictError if checkin already exists for this goal + week_start
    * Publish GOAL_CHECKIN_ADDED event after creation

  get_week_start(dt: datetime) -> datetime:
    Returns the Monday of the week containing dt, at midnight UTC.
    CRITICAL: must handle all edge cases correctly.
    Use: dt - timedelta(days=dt.weekday())
    Then replace hour=0, minute=0, second=0, microsecond=0
    Then ensure tzinfo=UTC if dt is naive

app/modules/goals/router.py:
  GET /goals (query params: archived, category, owner_id)
  POST /goals → 201
  GET /goals/{id}
  PATCH /goals/{id}
  DELETE /goals/{id} → 204
  POST /goals/{id}/check-ins → 201
  GET /goals/{id}/check-ins (query param: limit, default 12)

tests/modules/test_goals.py:
  get_week_start exhaustive tests:
    Monday → returns same day at midnight UTC
    Wednesday → returns previous Monday at midnight UTC
    Sunday → returns previous Monday at midnight UTC
    Across month boundary (e.g. Wednesday 1 March → Monday 27 Feb)
    Across year boundary (e.g. Wednesday 1 Jan → Monday 30 Dec previous year)
    Returns UTC midnight (no time component)
  create_checkin:
    success first checkin of the week
    duplicate same week → ConflictError
    two checkins different weeks → both succeed
  create_goal:
    owner_id from different family → ForbiddenError
  Verify SQS event published after checkin creation (mock publisher)

Follow all conventions in .cursor/rules exactly.
```

---

## Prompt 5 — Finances Module

**When:** After Prompt 4 verifies cleanly.
**Verify:** `pytest tests/modules/test_finances.py` passes. Test decimal
arithmetic precision manually — this is where float bugs hide.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Goals module complete. Implement the finances module.

app/modules/finances/schemas.py:
  CreateExpenseRequest: name, amount: Decimal (gt=Decimal("0")), currency (default GBP),
    category: ExpenseCategory, recurrence: Recurrence,
    next_due_date (optional), linked_goal_id (optional), source: ExpenseSource
  UpdateExpenseRequest: Partial of CreateExpenseRequest (all Optional)
  ExpenseResponse: full expense + linked_goal_title if linked
  CategoryTotal: category: ExpenseCategory, total: Decimal, monthly_equivalent: Decimal
  CategoryTrend: category, current_quarter: Decimal, previous_quarter: Decimal,
    change_percent: Decimal
  UpcomingRenewal: id, name, amount, next_due_date, recurrence
  ExpenseSummaryResponse: total_by_category: list[CategoryTotal],
    monthly_total: Decimal, quarterly_total: Decimal,
    upcoming_renewals: list[UpcomingRenewal],
    category_trends: list[CategoryTrend]
  ParsedExpenseRow: name, amount: Decimal, currency, category, recurrence,
    next_due_date (optional)
  ImportExpensesRequest: rows: list[ParsedExpenseRow]
  ImportExpensesResponse: imported: int

app/modules/finances/repository.py:
  list_expenses(session, family_id, category, is_active, linked_goal_id)
    -> list[Expense]
  find_expense(session, expense_id, family_id) -> Expense | None
  create_expense(session, family_id, data) -> Expense
    Single transaction: INSERT expense + INSERT expense_event (CREATED)
  update_expense(session, expense_id, family_id, data) -> Expense
    Single transaction: UPDATE expense + INSERT expense_event (UPDATED)
  deactivate_expense(session, expense_id, family_id) -> Expense
    Single transaction: SET is_active=False + INSERT expense_event (DEACTIVATED)
  get_expense_summary(session, family_id) -> dict
    SQLAlchemy func.sum grouped by category
    Quarterly comparison: current quarter vs previous quarter
    Upcoming renewals: next_due_date within 30 days
  bulk_create_expenses(session, family_id, rows) -> list[Expense]
    Single transaction for all rows
    INSERT expense_event CREATED for each in same transaction

app/modules/finances/service.py:
  list_expenses, get_expense
  create_expense: validate linked_goal_id belongs to same family if provided
    → publish EXPENSE_ADDED after creation
  update_expense: → publish EXPENSE_UPDATED
  deactivate_expense
  get_expense_summary
  import_expenses(session, family_id, data):
    Validate each row with Pydantic
    Call bulk_create_expenses — all-or-nothing transaction
    Publish EXPENSE_ADDED once after successful import
    Return ImportExpensesResponse with count

  All monetary arithmetic: use Python Decimal throughout
  Percent change: ((current - previous) / previous * 100).quantize(Decimal("0.1"))
  Never use float for any monetary calculation

app/modules/finances/router.py:
  GET /finances/expenses
  POST /finances/expenses → 201
  GET /finances/expenses/{id}
  PATCH /finances/expenses/{id}
  DELETE /finances/expenses/{id} → 204
  GET /finances/summary
  POST /finances/import → 201 ImportExpensesResponse

tests/modules/test_finances.py:
  create: success, invalid linked_goal_id from different family
  update: verify expense_event created in same transaction
  deactivate: is_active=False, expense_event DEACTIVATED created
  import: 10 rows success, one invalid row → nothing imported (transaction rollback)
  summary: category totals correct, trend calculation correct
  decimal precision test: verify £9.99 * 12 = £119.88 (not £119.87999...)
  Verify EXPENSE_ADDED published (mock publisher)

Follow all conventions in .cursor/rules exactly.
```

---

## Prompt 6 — Calendar Module

**When:** After Prompt 5 verifies cleanly.
**Verify:** `pytest tests/modules/test_calendar.py` passes. Test the
Google OAuth flow manually in a browser.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Finances module complete. Implement the calendar module. Read ADR-03 carefully.

app/modules/calendar/schemas.py:
  CalendarAccountResponse: id, user_id, provider, last_synced_at,
    sync_failure_count, provider_account_id
  CalendarEventResponse: id, title, description, start_time, end_time,
    is_all_day, color, calendar_account_id, owner_name
  CalendarViewResponse: events: list[CalendarEventResponse],
    accounts: list[CalendarAccountResponse], week_start, week_end
  OAuthUrlResponse: url: str

app/modules/calendar/repository.py:
  find_accounts_by_family(session, family_id) -> list[CalendarAccount]
  find_account(session, account_id, family_id) -> CalendarAccount | None
  create_account(session, data) -> CalendarAccount
  update_account(session, account_id, data) -> CalendarAccount
  increment_sync_failure(session, account_id) -> None
  reset_sync_failure(session, account_id) -> None
  upsert_events(session, events: list[dict]) -> None
    Use INSERT ... ON CONFLICT (calendar_account_id, external_id) DO UPDATE
    Process in chunks of 100
  get_events_for_range(session, family_id, from_dt, to_dt) -> list[CalendarEvent]
    Exclude where deleted_at IS NOT NULL
  mark_event_deleted(session, calendar_account_id, external_id) -> None

app/modules/calendar/service.py:
  get_oauth_url(user_id, family_id) -> Result[OAuthUrlResponse, AppError]
    Google OAuth2 URL with scopes: calendar.readonly, userinfo.email
    State param: signed JWT containing {user_id, family_id} — prevents CSRF
  handle_oauth_callback(session, code, state) -> Result[CalendarAccountResponse, AppError]
    Verify state JWT
    Exchange code for tokens via httpx to Google token endpoint
    Encrypt refresh token using encryption.encrypt()
    Create CalendarAccount record
    Publish CALENDAR_SYNCED to trigger initial sync
  get_calendar_view(session, family_id, week_start) -> Result[CalendarViewResponse, AppError]
    Read from local DB only — never call Google API directly
    Return events for 7 days starting week_start
    Merge events from ALL connected accounts in the family
  disconnect_account(session, account_id, family_id) -> Result[None, AppError]
    Revoke Google token via httpx POST to Google revoke endpoint
    Delete CalendarAccount (cascade deletes events)

app/modules/calendar/router.py:
  GET /calendar/oauth/url → OAuthUrlResponse
  GET /calendar/oauth/callback → RedirectResponse to frontend
  GET /calendar/view?week_start=YYYY-MM-DD → CalendarViewResponse
  GET /calendar/accounts → list[CalendarAccountResponse]
  DELETE /calendar/accounts/{id} → 204

app/shared/jobs/calendar_sync.py:
  sync_account(session, account_id: UUID) -> None
    Fetch CalendarAccount including encrypted refresh token
    Decrypt refresh token using encryption.decrypt()
    Refresh access token via httpx if needed
    Fetch events from Google Calendar API for next 90 days
    Call upsert_events with fetched events
    Mark events deleted that exist locally but not in Google response
    Update last_synced_at and reset sync_failure_count on success
    On any exception: increment_sync_failure
    If sync_failure_count >= 3: publish insight to surface reconnection warning
    Publish CALENDAR_SYNCED on success
  consume_calendar_sync_messages() -> None
    SQS long-polling consumer loop using aiobotocore

tests/modules/test_calendar.py:
  get_oauth_url: URL contains correct scopes, state is signed JWT
  handle_oauth_callback: success, invalid state, token exchange failure (mock httpx)
  get_calendar_view: correct 7-day range, multiple accounts merged,
    deleted events excluded
  sync_account: success resets failure count, failure increments count,
    3 failures publishes reconnection insight

Follow all conventions in .cursor/rules exactly.
```

---

## Prompt 7 — Insights Module

**When:** After Prompt 6 verifies cleanly.
**Verify:** `pytest tests/modules/test_insights.py` passes. Manually trigger
recalculation and verify snapshots in database via psql.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Calendar module complete. Implement the insights module. Read ADR-04 carefully.

app/modules/insights/rules/base.py:
  Abstract InsightRule class (or Protocol):
  - rule_id: str (abstract property)
  - severity: InsightSeverity (abstract property)
  - async evaluate(session: AsyncSession, family_id: UUID) -> InsightData | None
    Returns InsightData if condition is met, None if condition is resolved.
  InsightData dataclass: rule_id, message, severity, metadata: dict

Implement all 5 rules:

app/modules/insights/rules/unblocked_commitments.py
  rule_id = "unblocked_commitments", severity = WARNING
  Condition: goals where requires_time_block=True and archived_at IS NULL
    AND no CalendarEvent with matching title keywords in next 7 days
  Message: "{count} commitment(s) have no time blocked this week"
  Metadata: {goal_ids, goal_titles, count}

app/modules/insights/rules/goal_neglect.py
  rule_id = "goal_neglect_{goal_id}" (one instance per neglected goal)
  severity = INFO if < 35 days, WARNING if >= 35 days
  Condition: active goals with no checkin in 21+ days
  Message: "You haven't checked in on '{title}' in {days} days"
  Metadata: {goal_id, goal_title, days_since_checkin, owner_id, owner_name}

app/modules/insights/rules/category_spend.py
  rule_id = "category_spend_{category}", severity = INFO
  Condition: >20% quarter-over-quarter increase per category
  Message: "{category} spending is up {pct}% this quarter (£{current} vs £{previous})"
  Metadata: {category, current_quarter, previous_quarter, change_percent}

app/modules/insights/rules/subscription_renewal.py
  rule_id = "subscription_renewal", severity = INFO
  Condition: active expenses with next_due_date within 30 days
  Message: "{count} subscription(s) renewing in the next 30 days totalling £{total}"
  Metadata: {expenses: [{id, name, amount, next_due_date}], count, total}

app/modules/insights/rules/budget_pressure.py
  rule_id = "budget_pressure", severity = WARNING
  Condition: KIDS_ACTIVITIES > 40% of total monthly spend
  Message: "Kids' activities are {pct}% of monthly spending (£{amount}/month)"
  Metadata: {percentage, kids_activities_amount, total_monthly_amount}

app/modules/insights/repository.py:
  get_active_insights(session, family_id) -> list[InsightSnapshot]
    WHERE resolved_at IS NULL AND dismissed_at IS NULL
  upsert_insight(session, family_id, insight_data: InsightData) -> InsightSnapshot
    INSERT ... ON CONFLICT (family_id, rule_id) DO UPDATE
    Reset resolved_at to NULL if previously resolved
  resolve_insight(session, family_id, rule_id) -> None
    SET resolved_at = utcnow() WHERE resolved_at IS NULL
  dismiss_insight(session, insight_id, family_id) -> None
    SET dismissed_at = utcnow()

app/modules/insights/service.py:
  get_insights(session, family_id) -> Result[list[InsightResponse], AppError]
  dismiss_insight(session, insight_id, family_id) -> Result[None, AppError]
    NotFoundError if insight not in family
  recalculate_insights(session, family_id) -> Result[None, AppError]
    Run all rules with asyncio.gather(*[rule.evaluate(...) for rule in ALL_RULES],
      return_exceptions=True)
    For each result:
      If InsightData → upsert_insight
      If None → resolve_insight for that rule_id
      If exception → log error, continue (never let one rule failure stop others)

app/modules/insights/router.py:
  GET /insights → list[InsightResponse]
  POST /insights/{id}/dismiss → 204
  POST /insights/recalculate → 202 (triggers async, returns immediately)

app/shared/jobs/insight_recalc.py:
  consume_insight_recalc_messages(): SQS consumer loop
  Each message contains {family_id, trigger: EventType}
  Call recalculate_insights(session, family_id)
  Invalidate Redis cache key: dashboard:{family_id}

tests/modules/test_insights.py — for each rule, test at minimum:
  condition met → correct InsightData returned with correct message and metadata
  condition not met → None returned
  boundary values: exactly 21 days, exactly 40%, exactly 20% change
Also test:
  recalculate_insights: one rule raises exception → others still run
  dismiss_insight: success, wrong family_id → NotFoundError

Follow all conventions in .cursor/rules exactly.
```

---

## Prompt 8 — Background Jobs

**When:** After Prompt 7 verifies cleanly.
**Verify:** Trigger each job manually and verify output. All SQS consumers
start cleanly with `python -m app.main --worker`.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Core modules complete. Implement the remaining background jobs.

app/shared/jobs/weekly_digest.py:
  generate_digest(session: AsyncSession, family_id: UUID) -> DigestData:
    - All goals with latest checkin status
    - Category spend for current week
    - Upcoming calendar events for next 7 days
    - Top 3 active insights ordered by severity
    - Subscriptions renewing in next 7 days
  build_html_email(digest: DigestData) -> str:
    Clean minimal HTML, no external CSS frameworks.
    Subject line: f"Weave Weekly — {week_date_range}"
    Sections: Goals This Week, Money This Week, Week Ahead, Insights to Act On
    Each insight links to the relevant module (placeholder URL in V1)
    Footer: Weave branding, unsubscribe placeholder
  send_digest(session, family_id: UUID) -> None:
    Call generate_digest → build_html_email → send via boto3 SES
    Log {job: "weekly_digest", family_id, duration_ms, status}
  consume_weekly_digest_messages() -> None:
    SQS long-polling consumer loop

app/shared/jobs/tax_deadline_seeder.py:
  GERMAN_TAX_DEADLINES: dict[str, dict] — hardcoded registry:
    de_steuererklaerung: July 31 — Steuererklärung due (ELSTER)
    de_riester_contribution: Dec 31 — last day for Riester contributions
    de_rurup_contribution: Dec 31 — last day for Rürup contributions
    de_freistellungsauftrag: Jan 15 — review Sparerpauschbetrag allocation
    de_vorauszahlungen_q1: Mar 10 — quarterly prepayment Q1
    de_vorauszahlungen_q2: Jun 10 — quarterly prepayment Q2
    de_vorauszahlungen_q3: Sep 10 — quarterly prepayment Q3
    de_vorauszahlungen_q4: Dec 10 — quarterly prepayment Q4
  seed_tax_deadlines(session, year: int) -> None:
    For each family with a TaxProfile in jurisdiction 'DE':
      Upsert each deadline on (tax_profile_id, deadline_key, tax_year)
      Fully idempotent — safe to run multiple times
  consume_tax_deadline_seeder_messages() -> None:
    SQS consumer loop — triggered annually Jan 1 via AWS EventBridge

All jobs: structured logging {job, family_id, duration_ms, status, error}
All jobs: idempotent — safe to run multiple times with same result

app/main.py update:
  import sys
  if "--worker" in sys.argv:
    asyncio.run(start_all_workers())  # runs all SQS consumers concurrently
  else:
    uvicorn.run(create_app(), ...)

tests:
  generate_digest: returns correct structure with all sections populated (mock DB)
  send_digest: SES called with correct recipient and HTML (mock boto3)
  HTML contains all expected sections: Goals, Money, Week Ahead, Insights
  seed_tax_deadlines: correct 8 deadlines created for DE jurisdiction
  seed_tax_deadlines idempotency: running twice produces same result, not doubles

Follow all conventions in .cursor/rules exactly.
```

---

## Prompt 9 — weave-web Scaffold and Auth

**When:** After Prompt 8 verifies cleanly on weave-api. Switch to weave-web repo.
**Verify:** `uvicorn app.main:app --reload` is running on port 8000.
Login flow completes end to end against the live FastAPI backend.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

weave-api is complete and tested. Now scaffold and build the initial
weave-web frontend. This is a Next.js 14 App Router application with
TypeScript and Tailwind.

The FastAPI backend auto-generates OpenAPI docs at http://localhost:8000/docs
and http://localhost:8000/openapi.json — use this as the source of truth
for all request/response shapes.

PART 1 — Scaffold:
Create the complete folder structure:
  src/
    app/
      (auth)/
        login/page.tsx
        signup/page.tsx
      (dashboard)/
        layout.tsx
        page.tsx
        goals/page.tsx
        finances/page.tsx
        calendar/page.tsx
    components/
      ui/           (Button, Input, Card, Badge, Modal — minimal, no UI library)
      goals/
      finances/
      calendar/
      insights/
    lib/
      api-client.ts
      auth.ts
      utils.ts
    store/
      auth.store.ts
    types/
      index.ts      (TypeScript types mirroring FastAPI Pydantic schemas)

PART 2 — API client (src/lib/api-client.ts):
  Base URL: process.env.NEXT_PUBLIC_API_URL (FastAPI on port 8000)
  Generic get<T>, post<T>, patch<T>, delete<T> methods
  Auto-attach Authorization: Bearer {access_token} header
  On 401: auto-call POST /auth/refresh and retry once
  On refresh failure: redirect to /login
  All methods return Result<T> — never throw

PART 3 — Auth store (Zustand):
  { user, access_token (memory only, never localStorage), is_authenticated }
  Actions: set_auth(user, access_token), clear_auth()

PART 4 — Auth pages:
  /login: email + password, react-hook-form + Zod, POST /auth/login,
    on success → store in Zustand → redirect to dashboard
  /signup: family_name, name, email, password, confirm password,
    POST /auth/signup, on success → redirect to dashboard
  Inline error messages, no page reload on failure

PART 5 — Dashboard shell:
  layout.tsx: check auth → redirect to /login if missing
    Sidebar: Weave logo, Goals, Finances, Calendar nav items,
    user name at bottom, sign out button
  page.tsx (dashboard home): server component, fetch all four data sources,
    render: Insights panel, Goals this week, Money snapshot, Calendar strip
    loading.tsx skeleton, error.tsx boundary per section

Tailwind colour palette:
  primary: slate-900, accent: indigo-600, surface: white,
  muted: slate-100, text: slate-900, muted-text: slate-500,
  border: slate-200, success: emerald-600, warning: amber-500, error: red-600

Follow all conventions in weave-web .cursor/rules exactly.
Use server components by default. No useEffect for data fetching.
All forms use react-hook-form + Zod.
```

---

## Prompt 10 — weave-web Core Feature Pages

**When:** After Prompt 9 verifies cleanly. Dashboard loads with real data
from FastAPI.

```
@docs/PRODUCT_BRIEF.md @docs/ARCHITECTURE_DECISIONS.md

Dashboard shell is working. Implement the three core feature pages.
All API calls target NEXT_PUBLIC_API_URL (FastAPI backend).

PART 1 — Goals (src/app/(dashboard)/goals/):
  page.tsx: server component, fetch GET /goals
    Filter bar: All / Active / Archived, by category, by owner
    GoalCard: title, owner name, category badge, target date,
      latest checkin status chip, checkin streak count
    "Add Goal" button → AddGoalModal
    Empty state with prompt
  [goalId]/page.tsx: goal detail
    12-week contribution-style checkin grid (like GitHub activity)
    "Check In This Week" button → CheckinModal
      (disabled if already checked in this week)
    Linked expense if present, archive goal with confirmation

  Components:
    AddGoalModal: all CreateGoalRequest fields, owner selector, category selector
    CheckinModal: status selector (ON_TRACK / OFF_TRACK / BLOCKED), optional note
    GoalCard, CheckinGrid

PART 2 — Finances (src/app/(dashboard)/finances/):
  page.tsx: server component, fetch GET /finances/summary
    Monthly total prominently displayed
    Category breakdown horizontal bar chart (Recharts)
    Category trend indicators (↑ ↓ →) with percentage change
    Upcoming renewals list with due date badges
    "Add Expense" and "Import from Excel" buttons
  expenses/page.tsx: full expense list with filters, edit and deactivate actions

  Components:
    AddExpenseModal: all CreateExpenseRequest fields
    ImportFlow: multi-step component
      Step 1: drag-and-drop file upload (.xlsx, .xls, .csv)
      Step 2: column mapping UI
      Step 3: preview table (first 10 rows)
      Step 4: confirm → POST /finances/import with pre-parsed JSON rows
        (frontend parses with SheetJS, never sends raw file to API)
    CategoryBarChart (Recharts), TrendIndicator

PART 3 — Calendar (src/app/(dashboard)/calendar/):
  page.tsx: server component, fetch GET /calendar/view for current week
    7-day grid with navigation (prev/next week)
    Events coloured by account owner (you vs partner)
    "Connect Google Calendar" banner if no accounts
    "Last synced X minutes ago" per account
  connect/page.tsx:
    Fetch GET /calendar/oauth/url → show Google sign-in button
    After OAuth redirect back: show success state
    Connected accounts list with disconnect option

  Components:
    WeekGrid: 7-column calendar with time slots
    EventChip: coloured pill with title and time
    ConnectCalendarBanner

General requirements for all pages:
  loading.tsx skeleton per page
  error.tsx boundary per page
  Mobile responsive
  Optimistic updates where appropriate
  Zod validation on all forms

Follow all conventions in weave-web .cursor/rules exactly.
```

---

## After All 10 Prompts — Final Checklist

**Quality gates (weave-api):**
- [ ] `mypy app/` — zero errors
- [ ] `ruff check app/ tests/` — zero warnings
- [ ] `pytest --cov` — >80% coverage, 100% on shared/result and all insight rules
- [ ] `uvicorn app.main:app` starts cleanly
- [ ] FastAPI auto-docs accessible at GET /docs
- [ ] SonarCloud — no critical issues
- [ ] CodeRabbit reviewed at least one PR

**Quality gates (weave-web):**
- [ ] TypeScript compiles with zero errors
- [ ] All pages load against live FastAPI backend

**Functionality:**
- [ ] Signup, login, refresh, logout
- [ ] Invite family member
- [ ] Create goal, check in, verify duplicate check-in blocked
- [ ] Add expenses, import from Excel
- [ ] Connect Google Calendar, view unified calendar
- [ ] Insights generated and dismissable
- [ ] Weekly digest triggered manually via SQS

**Deployment:**
- [ ] `docker build` succeeds
- [ ] `docker-compose up` starts all services
- [ ] GitHub Actions CI passes on a PR
- [ ] Deployed to AWS ECS, accessible via a real URL
- [ ] AWS budget alert configured

---

## Handling Cursor Mistakes

When Cursor violates a convention, correct it with a targeted prompt:

```
The code in [filename] violates the rule in .cursor/rules that says:
"[quote the rule exactly]"

The violation is: [describe specifically what is wrong]

Fix it without changing any other behaviour.
```

Being specific about which rule was violated trains Cursor to avoid the
same mistake in future prompts.