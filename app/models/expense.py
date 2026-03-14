from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db.base import Base
from app.shared.db.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.family import Family
    from app.models.goal import Goal


class ExpenseCategory(StrEnum):
    KIDS_ACTIVITIES = "KIDS_ACTIVITIES"
    PERSONAL_GROWTH = "PERSONAL_GROWTH"
    HOUSEHOLD = "HOUSEHOLD"
    SAVINGS = "SAVINGS"
    ENTERTAINMENT = "ENTERTAINMENT"
    SUBSCRIPTIONS = "SUBSCRIPTIONS"
    INVESTMENT = "INVESTMENT"
    PROPERTY = "PROPERTY"
    PENSION = "PENSION"
    OTHER = "OTHER"


class Recurrence(StrEnum):
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    ANNUAL = "ANNUAL"
    ONE_OFF = "ONE_OFF"


class ExpenseSource(StrEnum):
    MANUAL = "MANUAL"
    EXCEL_IMPORT = "EXCEL_IMPORT"


class ExpenseEventType(StrEnum):
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    DEACTIVATED = "DEACTIVATED"


class Expense(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "expenses"

    family_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("families.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2, asdecimal=True), nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), default="GBP", nullable=False)
    category: Mapped[ExpenseCategory] = mapped_column(
        SQLEnum(ExpenseCategory, name="expense_category"),
        nullable=False,
    )
    recurrence: Mapped[Recurrence] = mapped_column(
        SQLEnum(Recurrence, name="recurrence"), nullable=False
    )
    next_due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    linked_goal_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("goals.id")
    )
    source: Mapped[ExpenseSource] = mapped_column(
        SQLEnum(ExpenseSource, name="expense_source"),
        default=ExpenseSource.MANUAL,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    family: Mapped[Family] = relationship(back_populates="expenses")
    linked_goal: Mapped[Goal | None] = relationship(back_populates="expenses")
    events: Mapped[list[ExpenseEvent]] = relationship(back_populates="expense")


class ExpenseEvent(Base, UUIDMixin):
    __tablename__ = "expense_events"

    expense_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("expenses.id", ondelete="CASCADE"),
        nullable=False,
    )
    event_type: Mapped[ExpenseEventType] = mapped_column(
        SQLEnum(ExpenseEventType, name="expense_event_type"),
        nullable=False,
    )
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    expense: Mapped[Expense] = relationship(back_populates="events")
