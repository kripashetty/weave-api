from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db.base import Base
from app.shared.db.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.calendar import CalendarAccount
    from app.models.expense import Expense
    from app.models.goal import Goal
    from app.models.insight import InsightSnapshot
    from app.models.tax import TaxProfile
    from app.models.user import User


class Family(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "families"

    organisation_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    members: Mapped[list[User]] = relationship(back_populates="family")
    goals: Mapped[list[Goal]] = relationship(back_populates="family")
    expenses: Mapped[list[Expense]] = relationship(back_populates="family")
    calendar_accounts: Mapped[list[CalendarAccount]] = relationship(
        back_populates="family"
    )
    insight_snapshots: Mapped[list[InsightSnapshot]] = relationship(
        back_populates="family"
    )
    tax_profile: Mapped[TaxProfile | None] = relationship(
        back_populates="family", uselist=False
    )
