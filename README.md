# Weave API — FastAPI backend for a family life operating system

## Documentation
- [Product Brief](./docs/PRODUCT_BRIEF.md)
- [Architecture Decisions](./docs/adr/)
- [Scaling Strategy](./docs/SCALING.md)

## Development
make install       # install dependencies and pre-commit hooks
make docker-up     # start postgres + redis
make migrate       # apply all migrations
make dev           # start FastAPI with hot reload on port 8000
make check         # run lint + typecheck
make test          # run test suite
make help          # list all available commands

## Tech Stack
FastAPI, SQLAlchemy 2.0 async, Alembic, Pydantic v2, asyncpg,
PostgreSQL, Redis (aioredis), AWS SQS + SES, python-jose RS256
