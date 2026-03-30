"""Reports API endpoints.

This module provides endpoints for fetching analysis reports.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.domain import CoachingReportResponse
from app.services.repository import report_repo, player_repo

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{puuid}", response_model=List[CoachingReportResponse])
async def get_player_reports(
    puuid: str, role: Optional[str] = None, db: AsyncSession = Depends(get_db)
) -> List[CoachingReportResponse]:
    """Retrieve all coaching reports generated for a specific player PUUID.

    Args:
        puuid (str): The unique player identifier.
        role (Optional[str]): Limit returned reports securely to exact role metrics.
        db (AsyncSession): The database session.

    Returns:
        List[CoachingReportResponse]: A list of coaching reports associated with the player.
    """
    reports = await report_repo.get_by_player(db, puuid=puuid, role=role)

    # Evaluate cache staleness server-side natively (2 hours threshold)
    is_stale = True
    if reports:
        latest = reports[0]
        now_utc = datetime.now(timezone.utc)
        gen_at = latest.generated_at
        # Normalize naive datetimes (from datetime.utcnow defaults) to UTC-aware
        if gen_at.tzinfo is None:
            gen_at = gen_at.replace(tzinfo=timezone.utc)
        if (now_utc - gen_at).total_seconds() < 7200:
            is_stale = False

    if is_stale or not reports:
        player = await player_repo.get_by_puuid(db, puuid=puuid)
        if player:
            from app.api.api_v1.endpoints.matches import analyze_latest_match
            try:
                # Trigger internal analysis directly avoiding explicit frontend coordination
                await analyze_latest_match(region=player.region, puuid=puuid, role=role, db=db)
                # Re-fetch organically to reflect updated arrays
                reports = await report_repo.get_by_player(db, puuid=puuid, role=role)
            except Exception as e:
                logger.error(f"Failed to auto-update stale report for {puuid}: {e}")

    return reports
