"""Reports API endpoints.

This module provides endpoints for fetching analysis reports.
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.domain import CoachingReportResponse
from app.services.repository import report_repo

router = APIRouter()


@router.get("/{puuid}", response_model=List[CoachingReportResponse])
async def get_player_reports(
    puuid: str, db: AsyncSession = Depends(get_db)
) -> List[CoachingReportResponse]:
    """Retrieve all coaching reports generated for a specific player PUUID.

    Args:
        puuid (str): The unique player identifier.
        db (AsyncSession): The database session.

    Returns:
        List[CoachingReportResponse]: A list of coaching reports associated with the player.
    """
    reports = await report_repo.get_by_player(db, puuid=puuid)
    return reports
