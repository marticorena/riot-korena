"""SQLAlchemy Domain Models.

This module contains the ORM entity definitions reflecting the PostgreSQL schema.
"""

from datetime import datetime
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Player(Base):
    """Player ORM Model mapping to the players table.

    Attributes:
        puuid (str): The primary Riot unique identifier.
        game_name (str): The Riot account game name.
        tag_line (str): The Riot account tagline.
        region (str): The routing region of the player.
        reports (list[CoachingReport]): 1-to-many relationship mapping.
    """

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
    """MatchCache ORM Model to store raw JSON payloads from Riot API.

    Attributes:
        match_id (str): The Riot Match ID.
        raw_match_data (dict): The generic match structural dictionary payload.
        raw_timeline_data (dict): The generic timeline dataframe equivalent payload.
        analyzed (bool): Whether the heuristics engine has processed it.
    """

    __tablename__ = "match_cache"

    match_id: Mapped[str] = mapped_column(String, primary_key=True)
    raw_match_data = mapped_column(JSONB, nullable=False)
    raw_timeline_data = mapped_column(JSONB, nullable=False)
    analyzed: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=text("false")
    )


class CoachingReport(Base):
    """CoachingReport ORM Model storing the heuristics deductions.

    Attributes:
        id (str): Generated UUID for the report.
        puuid (str): The player identifier link.
        generated_at (datetime): Database generated timestamp.
        critical_moments (dict): Filtered timestamp highlights.
        habits (dict): Calculated habit metric deductions.
        training_plan (dict): Textual instruction recommendations.
    """

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
