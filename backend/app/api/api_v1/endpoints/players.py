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
):
    """
    Lookup a player by Riot ID. Fetches from Riot API if not in DB,
    caching the result locally to minimize rate limits visually.
    """
    player = await player_repo.get_by_riot_id(
        db, game_name=game_name, tag_line=tag_line, region=region
    )
    if player:
        return player

    account_data = await riot_client.get_account_by_riot_id(game_name, tag_line, region)
    if not account_data:
        raise HTTPException(status_code=404, detail="Player not found in Riot DB")

    new_player_data = {
        "puuid": account_data["puuid"],
        "game_name": account_data["gameName"],
        "tag_line": account_data["tagLine"],
        "region": region,
    }
    player = await player_repo.create(db, obj_in=new_player_data)
    return player
