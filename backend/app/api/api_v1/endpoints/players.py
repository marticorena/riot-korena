"""Players API endpoints.

This module provides endpoints for retrieving and managing player profiles.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.domain import PlayerResponse
from app.services.repository import player_repo
from app.services.riot_client import riot_client

router = APIRouter()


@router.get("/{region}/{game_name}/{tag_line}", response_model=PlayerResponse)
async def get_player(
    region: str, game_name: str, tag_line: str, db: AsyncSession = Depends(get_db)
) -> PlayerResponse:
    """Lookup a player by Riot ID.

    Fetches from Riot API if not in DB, caching the result locally
    to minimize rate limits.

    Args:
        region (str): The region corresponding to the Riot account.
        game_name (str): The Game Name (e.g., 'Faker').
        tag_line (str): The Tag Line (e.g., 'KR1').
        db (AsyncSession): The database session.

    Returns:
        PlayerResponse: The player information payload.

    Raises:
        HTTPException: If the player cannot be found in the Riot DB.
    """
    player = await player_repo.get_by_riot_id(
        db, game_name=game_name, tag_line=tag_line, region=region
    )
    
    if player and player.summoner_level is not None:
        # Player is already fully hydrated in cache
        return player

    import httpx
    try:
        account_data = await riot_client.get_account_by_riot_id(game_name, tag_line, region)
    except httpx.HTTPStatusError as e:
        if e.response.status_code in (401, 403):
            raise HTTPException(status_code=500, detail="The Riot API key has expired or is unauthorized.")
        raise HTTPException(status_code=500, detail="Failed to connect to Riot servers.")
        
    if not account_data:
        raise HTTPException(status_code=404, detail="Player not found in Riot DB (Check Riot ID).")

    puuid = account_data.get("puuid")
    player_by_puuid = await player_repo.get_by_puuid(db, puuid)
    
    summoner_data = await riot_client.get_summoner_by_puuid(puuid, region)
    
    summoner_id = None
    profile_icon_id = None
    summoner_level = None

    if summoner_data:
        profile_icon_id = summoner_data.get("profileIconId")
        summoner_level = summoner_data.get("summonerLevel")
        summoner_id = summoner_data.get("id")

    new_player_data = {
        "puuid": puuid,
        "game_name": account_data["gameName"],
        "tag_line": account_data["tagLine"],
        "region": region,
        "summoner_level": summoner_level,
        "profile_icon_id": profile_icon_id,
        "summoner_id": summoner_id,
    }
    
    if player_by_puuid:
        player = await player_repo.update(db, db_obj=player_by_puuid, obj_in=new_player_data)
    else:
        player = await player_repo.create(db, obj_in=new_player_data)
        
    return player

@router.get("/{region}/by-puuid/{puuid}/history")
async def get_player_history(region: str, puuid: str, role: str = None):
    """Fetch recent matches specifically optimized for UI rendering, optionally filtered by role."""
    import asyncio
    match_ids = await riot_client.get_match_ids_by_puuid(puuid, region, count=20)
    if not match_ids:
        return []

    tasks = [riot_client.get_match_by_id(mid, region) for mid in match_ids]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    history = []
    for match_data in results:
        if isinstance(match_data, dict) and "info" in match_data:
            info = match_data["info"]
            participants = info.get("participants", [])
            p_data = next((p for p in participants if p.get("puuid") == puuid), None)
            
            if p_data:
                # If role filter exists, strictly skip matches where the player did not play the role
                if role and p_data.get("teamPosition") != role.upper():
                    continue

                history.append({
                    "match_id": match_data.get("metadata", {}).get("matchId", ""),
                    "win": p_data.get("win", False),
                    "kills": p_data.get("kills", 0),
                    "deaths": p_data.get("deaths", 0),
                    "assists": p_data.get("assists", 0),
                    "champion_name": p_data.get("championName", ""),
                    "game_duration": info.get("gameDuration", 0),
                    "game_creation": info.get("gameCreation", 0),
                    "queue_id": info.get("queueId", 0)
                })
                
                # Soft cap history output to top 5
                if len(history) >= 5:
                    break
    return history

from typing import List
from app.schemas.domain import RankEntryResponse

@router.get("/{region}/by-puuid/{puuid}/ranks", response_model=List[RankEntryResponse])
async def get_player_ranks(region: str, puuid: str, db: AsyncSession = Depends(get_db)):
    """Fetch real-time ranked entries using modern Riot PUUID endpoints."""
    raw_ranks = await riot_client.get_ranked_info_by_puuid(puuid, region)
    if not raw_ranks:
        return []
    
    return [
        RankEntryResponse(
            queueType=entry.get("queueType", "UNKNOWN"),
            tier=entry.get("tier"),
            rank=entry.get("rank"),
            leaguePoints=entry.get("leaguePoints", 0),
            wins=entry.get("wins", 0),
            losses=entry.get("losses", 0)
        )
        for entry in raw_ranks if entry.get("queueType") in ["RANKED_SOLO_5x5", "RANKED_FLEX_SR"]
    ]
