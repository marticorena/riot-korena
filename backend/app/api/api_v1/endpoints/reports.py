from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.domain import CoachingReportResponse
from app.services.repository import report_repo

router = APIRouter()


@router.get("/{puuid}", response_model=List[CoachingReportResponse])
async def get_player_reports(puuid: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieve all coaching reports generated for a specific player PUUID.
    """
    reports = await report_repo.get_by_player(db, puuid=puuid)
    return reports
