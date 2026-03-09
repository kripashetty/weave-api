# weave-api

Fastify + TypeScript + Prisma backend for [Weave](../README.md) — the shared family command centre.

## Docs

- [Product Brief](docs/PRODUCT_BRIEF.md) — vision, roadmap, database schema, auth design, coding conventions
- [Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md) — ADR-01 through ADR-10
- [Scaling Analysis](docs/SCALING.md) — bottlenecks, infrastructure roadmap, commercial paths

## Quick Start

```bash
cp .env.example .env          # fill in your values
npm install
npm run db:generate           # generate Prisma client
npm run db:migrate            # run migrations (requires DATABASE_URL)
npm run dev                   # start dev server on :3001
```

## Stack

| Layer | Technology |
|---|---|
| API | Fastify 5, TypeScript |
| ORM | Prisma 6, PostgreSQL |
| Cache | Redis (Upstash) |
| Queue | AWS SQS |
| Email | AWS SES |
| Auth | Custom JWT + RBAC (RS256) |

## Structure

```
src/
  modules/        # auth, family, goals, finances, calendar, insights, tax
  shared/         # db, middleware, jobs, events, errors
  config.ts       # env var validation (Zod) — exits on invalid config
  app.ts          # Fastify bootstrap
prisma/
  schema.prisma   # source of truth for DB schema
```

## Commands

```bash
npm run dev              # development server (tsx watch)
npm run build            # compile to dist/
npm run test             # run all tests (vitest)
npm run test:coverage    # coverage report
npm run db:studio        # Prisma Studio (visual DB browser)
npm run typecheck        # TypeScript type check without emitting
```
