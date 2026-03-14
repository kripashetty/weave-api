from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db.base import Base
from app.shared.db.mixins import SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.expense import Expense
    from app.models.family import Family
    from app.models.user import User


class GoalCategory(StrEnum):
    PERSONAL_GROWTH = "PERSONAL_GROWTH"
    KIDS_DEVELOPMENT = "KIDS_DEVELOPMENT"
    FAMILY = "FAMILY"
    HEALTH = "HEALTH"
    FINANCIAL = "FINANCIAL"
    OTHER = "OTHER"


class CheckinStatus(StrEnum):
    ON_TRACK = "ON_TRACK"
    OFF_TRACK = "OFF_TRACK"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"


class Goal(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "goals"

    family_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("families.id", ondelete="CASCADE"),
        nullable=False,
    )
    owner_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[GoalCategory] = mapped_column(
        SQLEnum(GoalCategory, name="goal_category"), nullable=False
    )
    target_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    requires_time_block: Mapped[bool] = mapped_column(default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    family: Mapped[Family] = relationship(back_populates="goals")
    owner: Mapped[User] = relationship(back_populates="goals")
    checkins: Mapped[list[GoalCheckin]] = relationship(back_populates="goal")
    expenses: Mapped[list[Expense]] = relationship(back_populates="linked_goal")


class GoalCheckin(Base, UUIDMixin):
    __tablename__ = "goal_checkins"
    __table_args__ = (
        UniqueConstraint("goal_id", "week_start", name="uq_goal_week_start"),
    )

    goal_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("goals.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    week_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[CheckinStatus] = mapped_column(
        SQLEnum(CheckinStatus, name="checkin_status"), nullable=False
    )
    note: Mapped[str | None] = mapped_column(String, nullable=True)
    checked_in_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    goal: Mapped[Goal] = relationship(back_populates="checkins")
    user: Mapped[User] = relationship(back_populates="checkins")
