"""Matches API endpoints.

This module provides endpoints for ingesting and processing Match data.
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.services.heuristics import heuristics_engine
from app.services.repository import report_repo

router = APIRouter()


@router.post("/ingest/{puuid}")
async def ingest_match(
    puuid: str,
    match_data: Dict[str, Any],
    timeline_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Ingest raw match arrays and structural timelines.

    Parses data into heuristics engine and directly provisions
    analytical reports into PostgreSQL.

    Args:
        puuid (str): The Player Unique Identifier.
        match_data (Dict[str, Any]): The raw match data from Riot API.
        timeline_data (Dict[str, Any]): The raw timeline data from Riot API.
        db (AsyncSession): The database session.

    Returns:
        Dict[str, Any]: A dictionary containing the status and the new report ID.

    Raises:
        HTTPException: If an error occurs during parsing or database insertion.
    """
    try:
        analysis_result = await heuristics_engine.analyze_match(
            match_data, timeline_data
        )

        report_in = {
            "puuid": puuid,
            "critical_moments": analysis_result.get("critical_moments"),
            "habits": analysis_result.get("habits"),
            "training_plan": analysis_result.get("training_plan"),
        }

        report = await report_repo.create(db, obj_in=report_in)
        return {"status": "success", "report_id": report.id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
