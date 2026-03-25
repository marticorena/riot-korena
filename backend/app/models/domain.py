import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Player(Base):
    __tablename__ = "players"

    puuid: Mapped[str] = mapped_column(String, primary_key=True)
    game_name: Mapped[str] = mapped_column(String, nullable=False)
    tag_line: Mapped[str] = mapped_column(String, nullable=False)
    region: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships mapped dynamically
    reports: Mapped[list["CoachingReport"]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )


class MatchCache(Base):
    __tablename__ = "match_cache"

    match_id: Mapped[str] = mapped_column(String, primary_key=True)
    raw_match_data = mapped_column(JSONB, nullable=False)
    raw_timeline_data = mapped_column(JSONB, nullable=False)
    analyzed: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=text("false")
    )


class CoachingReport(Base):
    __tablename__ = "coaching_reports"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    puuid: Mapped[str] = mapped_column(ForeignKey("players.puuid"), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, server_default=text("now()")
    )

    # Store aggregated evaluations
    critical_moments = mapped_column(JSONB)
    habits = mapped_column(JSONB)
    training_plan = mapped_column(JSONB)

    # Relationships recursively resolved
    player: Mapped["Player"] = relationship(back_populates="reports")
