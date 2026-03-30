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
            match_data, timeline_data, puuid
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


@router.post("/analyze/{region}/{puuid}")
async def analyze_latest_match(
    region: str,
    puuid: str,
    role: str = None,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Auto-fetch the latest match, contextually filtering by role if provided, and generate report."""
    from app.services.riot_client import riot_client
    try:
        # Fetch up to 10 latest hits to search for role presence 
        match_ids = await riot_client.get_match_ids_by_puuid(puuid, region, count=10)
        if not match_ids:
            raise HTTPException(status_code=404, detail="No matches found.")
        
        target_match_id = None
        target_match_data = None
        target_timeline_data = None
        
        if role:
            # We strictly search recent history for this specific role matching
            for mid in match_ids:
                m_data = await riot_client.get_match_by_id(mid, region)
                if not m_data or "info" not in m_data:
                    continue
                p_data = next((p for p in m_data["info"].get("participants", []) if p.get("puuid") == puuid), None)
                if p_data and p_data.get("teamPosition") == role.upper():
                    target_match_id = mid
                    target_match_data = m_data
                    break
        else:
            target_match_id = match_ids[0]
            target_match_data = await riot_client.get_match_by_id(target_match_id, region)
            
        if not target_match_id or not target_match_data:
            if role:
                raise HTTPException(status_code=404, detail=f"No recent matches found for role {role}.")
            raise HTTPException(status_code=500, detail="Match lookup resolution failed.")

        target_timeline_data = await riot_client.get_match_timeline_by_id(target_match_id, region)
        
        if not target_timeline_data:
            raise HTTPException(status_code=500, detail="Riot API timeout fetching match timeline.")

        analysis_result = await heuristics_engine.analyze_match(
            target_match_data, target_timeline_data, puuid
        )

        actual_role = None
        if target_match_data and "info" in target_match_data:
            p_ext = next((p for p in target_match_data["info"].get("participants", []) if p.get("puuid") == puuid), None)
            if p_ext:
                actual_role = p_ext.get("teamPosition")

        report_in = {
            "puuid": puuid,
            "role": actual_role,
            "critical_moments": analysis_result.get("critical_moments"),
            "habits": analysis_result.get("habits"),
            "training_plan": analysis_result.get("training_plan"),
        }
        report = await report_repo.create(db, obj_in=report_in)
        # Return dict serialization for fast-api endpoint fallback mapped response
        return {
            "id": str(report.id),
            "puuid": report.puuid,
            "role": report.role,
            "critical_moments": report.critical_moments,
            "habits": report.habits,
            "training_plan": report.training_plan
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
