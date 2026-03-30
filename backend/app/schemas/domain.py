"""Pydantic Domain Schemas.

This module provides validation schemas mapping to incoming HTTP requests
and outgoing HTTP responses.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class PlayerBase(BaseModel):
    """Base structural model for Player properties."""

    puuid: str
    game_name: str
    tag_line: str
    region: str
    summoner_level: Optional[int] = None
    profile_icon_id: Optional[int] = None
    summoner_id: Optional[str] = None


class RankEntryResponse(BaseModel):
    """Rank item definition fetched from League-V4."""
    queueType: str
    tier: Optional[str] = None
    rank: Optional[str] = None
    leaguePoints: Optional[int] = 0
    wins: Optional[int] = 0
    losses: Optional[int] = 0


class PlayerResponse(PlayerBase):
    """Response validation schema for returning player data."""

    model_config = ConfigDict(from_attributes=True)


class CoachingReportBase(BaseModel):
    """Base schema for abstracting the raw JSON payloads."""

    role: Optional[str] = None
    critical_moments: Optional[Dict[str, Any]] = {}
    habits: Optional[Dict[str, Any]] = {}
    training_plan: Optional[Dict[str, Any]] = {}


class CoachingReportResponse(CoachingReportBase):
    """Response schema containing completed DB-level attributes."""

    id: str
    puuid: str
    generated_at: datetime
    model_config = ConfigDict(from_attributes=True)
