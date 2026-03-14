from __future__ import annotations

from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db.base import Base
from app.shared.db.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.calendar import CalendarAccount
    from app.models.family import Family
    from app.models.goal import Goal, GoalCheckin


class FamilyRole(StrEnum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    family_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("families.id", ondelete="CASCADE"),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[FamilyRole] = mapped_column(
        SQLEnum(FamilyRole, name="family_role"),
        default=FamilyRole.MEMBER,
        nullable=False,
    )
    google_refresh_token_enc: Mapped[str | None] = mapped_column(String, nullable=True)

    family: Mapped[Family] = relationship(back_populates="members")
    goals: Mapped[list[Goal]] = relationship(back_populates="owner")
    checkins: Mapped[list[GoalCheckin]] = relationship(back_populates="user")
    calendar_accounts: Mapped[list[CalendarAccount]] = relationship(back_populates="user")
