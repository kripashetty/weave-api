.PHONY: install dev lint lint-fix format typecheck check test test-cov test-module migrate migrate-create migrate-down migrate-history db-reset docker-up docker-down docker-build docker-logs worker clean help

install: ## Install dependencies and pre-commit hooks
	pip install -e ".[dev]" && pre-commit install

dev: ## Start API with hot reload on port 8000
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

lint: ## Run ruff checks
	ruff check app/ tests/

lint-fix: ## Run ruff with autofix
	ruff check --fix app/ tests/

format: ## Format code with ruff
	ruff format app/ tests/

typecheck: ## Run mypy on app
	mypy app/

check: lint typecheck ## Run lint and type checks
	@echo "All checks passed"

test: ## Run test suite
	pytest

test-cov: ## Run tests with coverage
	pytest --cov=app --cov-report=term-missing --cov-report=xml

test-module: ## Run tests for a module (usage: make test-module module=goals)
	pytest tests/modules/$(module)/

migrate: ## Apply all migrations
	alembic upgrade head

migrate-create: ## Create migration (usage: make migrate-create name=message)
	alembic revision --autogenerate -m "$(name)"

migrate-down: ## Downgrade one migration
	alembic downgrade -1

migrate-history: ## Show migration history
	alembic history --verbose

db-reset: ## Reset DB to base and re-apply migrations
	alembic downgrade base && alembic upgrade head

docker-up: ## Start docker services
	docker-compose up -d

docker-down: ## Stop docker services
	docker-compose down

docker-build: ## Build docker images
	docker-compose build

docker-logs: ## Tail weave-api logs
	docker-compose logs -f weave-api

worker: ## Run all workers
	python -m app.main --worker

clean: ## Remove cache and coverage artifacts
	python -c "import pathlib, shutil; p=pathlib.Path('.'); [shutil.rmtree(x, ignore_errors=True) for x in p.rglob('__pycache__')]; [shutil.rmtree(p/d, ignore_errors=True) for d in ('.mypy_cache','.ruff_cache','.pytest_cache')]; [ (p/f).unlink() for f in ('coverage.xml','.coverage') if (p/f).exists() ]"

help: ## Print available targets
	@awk 'BEGIN {FS = ":.*##"}; /^[a-zA-Z0-9_-]+:.*##/ {printf "%-16s %s\\n", $$1, $$2}' $(MAKEFILE_LIST)
