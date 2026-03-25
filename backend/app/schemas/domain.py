from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class PlayerBase(BaseModel):
    puuid: str
    game_name: str
    tag_line: str
    region: str


class PlayerResponse(PlayerBase):
    model_config = ConfigDict(from_attributes=True)


class CoachingReportBase(BaseModel):
    critical_moments: Optional[Dict[str, Any]] = {}
    habits: Optional[Dict[str, Any]] = {}
    training_plan: Optional[Dict[str, Any]] = {}


class CoachingReportResponse(CoachingReportBase):
    id: str
    puuid: str
    generated_at: datetime
    model_config = ConfigDict(from_attributes=True)
