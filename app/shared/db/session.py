from collections.abc import AsyncIterator
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.db.base import AsyncSessionLocal


async def set_tenant_context(db: AsyncSession, family_id: UUID) -> None:
    await db.execute(
        text("SELECT set_config('app.family_id', :family_id, true)"),
        {"family_id": str(family_id)},
    )


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session
