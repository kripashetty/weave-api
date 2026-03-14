from __future__ import annotations

from datetime import UTC, date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db.base import Base
from app.shared.db.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.family import Family


class GermanTaxClass(StrEnum):
    KLASSE_I = "KLASSE_I"
    KLASSE_II = "KLASSE_II"
    KLASSE_III = "KLASSE_III"
    KLASSE_IV = "KLASSE_IV"
    KLASSE_V = "KLASSE_V"
    KLASSE_VI = "KLASSE_VI"


class IncomeBracket(StrEnum):
    UNDER_30K = "UNDER_30K"
    BETWEEN_30K_60K = "BETWEEN_30K_60K"
    BETWEEN_60K_100K = "BETWEEN_60K_100K"
    BETWEEN_100K_200K = "BETWEEN_100K_200K"
    OVER_200K = "OVER_200K"


class TaxProfile(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "tax_profiles"

    family_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("families.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    jurisdiction: Mapped[str] = mapped_column(String(2), nullable=False)
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False)
    filing_status: Mapped[GermanTaxClass] = mapped_column(
        SQLEnum(GermanTaxClass, name="german_tax_class"),
        nullable=False,
    )
    household_income_bracket: Mapped[IncomeBracket] = mapped_column(
        SQLEnum(IncomeBracket, name="income_bracket"),
        nullable=False,
    )
    is_married: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_self_employed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_rental_income: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    children_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    children_dob: Mapped[list[date]] = mapped_column(
        ARRAY(Date), default=list, nullable=False
    )
    freistellungsauftrag: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2, asdecimal=True),
        nullable=True,
    )
    pension_contrib_ytd: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2, asdecimal=True),
        nullable=True,
    )
    property_purchase_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    family: Mapped[Family] = relationship(back_populates="tax_profile")
    tax_deadlines: Mapped[list[TaxDeadline]] = relationship(back_populates="tax_profile")


class TaxDeadline(Base, UUIDMixin):
    __tablename__ = "tax_deadlines"
    __table_args__ = (
        UniqueConstraint(
            "tax_profile_id", "deadline_key", "tax_year", name="uq_tax_profile_key_year"
        ),
    )

    tax_profile_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("tax_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    jurisdiction: Mapped[str] = mapped_column(String(2), nullable=False)
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False)
    deadline_key: Mapped[str] = mapped_column(String(128), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    dismissed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    tax_profile: Mapped[TaxProfile] = relationship(back_populates="tax_deadlines")
