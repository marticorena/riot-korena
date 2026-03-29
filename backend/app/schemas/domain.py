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


class PlayerResponse(PlayerBase):
    """Response validation schema for returning player data."""

    model_config = ConfigDict(from_attributes=True)


class CoachingReportBase(BaseModel):
    """Base schema for abstracting the raw JSON payloads."""

    critical_moments: Optional[Dict[str, Any]] = {}
    habits: Optional[Dict[str, Any]] = {}
    training_plan: Optional[Dict[str, Any]] = {}


class CoachingReportResponse(CoachingReportBase):
    """Response schema containing completed DB-level attributes."""

    id: str
    puuid: str
    generated_at: datetime
    model_config = ConfigDict(from_attributes=True)
