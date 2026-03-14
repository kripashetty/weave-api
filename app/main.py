from __future__ import annotations

import asyncio
import sys
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from importlib import import_module
from typing import Any, cast
from uuid import uuid4

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sentry_sdk.integrations.fastapi import FastApiIntegration

from app.config import settings
from app.shared.errors import AppError


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    settings.model_dump()
    yield


def create_app() -> FastAPI:
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[FastApiIntegration()],
            environment=settings.environment,
        )

    app = FastAPI(title="Weave API", version="0.1.0", lifespan=lifespan)

    @app.middleware("http")
    async def correlation_id_middleware(request: Request, call_next: Any) -> Any:
        correlation_id = request.headers.get("x-correlation-id", str(uuid4()))
        request.state.correlation_id = correlation_id
        response = await call_next(request)
        response.headers["x-correlation-id"] = correlation_id
        return response

    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "message": exc.message},
        )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat(),  # noqa: UP017
            "version": "0.1.0",
        }

    return app


async def _resolve_worker(
    module_name: str, func_name: str
) -> Callable[[], Awaitable[None]]:
    module = import_module(module_name)
    func: object = getattr(module, func_name, None)
    if callable(func):
        return cast(Callable[[], Awaitable[None]], func)

    async def _noop_worker() -> None:
        return None

    return _noop_worker


async def start_all_workers() -> None:
    workers = await asyncio.gather(
        _resolve_worker(
            "app.shared.jobs.calendar_sync", "consume_calendar_sync_messages"
        ),
        _resolve_worker(
            "app.shared.jobs.insight_recalc", "consume_insight_recalc_messages"
        ),
        _resolve_worker(
            "app.shared.jobs.weekly_digest", "consume_weekly_digest_messages"
        ),
        _resolve_worker(
            "app.shared.jobs.tax_deadline_seeder", "consume_tax_deadline_seeder_messages"
        ),
    )
    await asyncio.gather(*(worker() for worker in workers))


app = create_app()


if __name__ == "__main__":
    if "--worker" in sys.argv:
        asyncio.run(start_all_workers())
