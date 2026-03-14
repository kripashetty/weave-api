from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.db.base import Base
from app.shared.db.mixins import UUIDMixin

if TYPE_CHECKING:
    from app.models.family import Family


class InsightSeverity(StrEnum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class InsightSnapshot(Base, UUIDMixin):
    __tablename__ = "insight_snapshots"
    __table_args__ = (
        UniqueConstraint(
            "family_id", "rule_id", "resolved_at", name="uq_family_rule_resolved_at"
        ),
    )

    family_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("families.id", ondelete="CASCADE"),
        nullable=False,
    )
    rule_id: Mapped[str] = mapped_column(String(128), nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[InsightSeverity] = mapped_column(
        SQLEnum(InsightSeverity, name="insight_severity"),
        default=InsightSeverity.INFO,
        nullable=False,
    )
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    dismissed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    family: Mapped[Family] = relationship(back_populates="insight_snapshots")
