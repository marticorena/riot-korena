"""Database Repository Access Layer.

This module provides an abstraction layer interacting dynamically
with SQL DB operations keeping routers extremely DRY.
"""

from typing import Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.domain import CoachingReport, Player


class PlayerRepository:
    """Handles CRUD operations mapping against the Player table."""

    async def get_by_puuid(self, db: AsyncSession, puuid: str) -> Optional[Player]:
        """Fetch a specific Player by Riot PUUID.

        Args:
            db (AsyncSession): Active database session.
            puuid (str): The string identifier.

        Returns:
            Optional[Player]: Resultant DB Model, or None.
        """
        result = await db.execute(select(Player).filter(Player.puuid == puuid))
        return result.scalars().first()

    async def get_by_riot_id(
        self, db: AsyncSession, game_name: str, tag_line: str, region: str
    ) -> Optional[Player]:
        """Fetch a specific Player resolving their natural Riot ID.

        Args:
            db (AsyncSession): Active database session.
            game_name (str): Riot Game Name.
            tag_line (str): Riot Tag Line.
            region (str): Mapped structural region.

        Returns:
            Optional[Player]: Database mapped record or None.
        """
        result = await db.execute(
            select(Player).filter(
                Player.game_name == game_name,
                Player.tag_line == tag_line,
                Player.region == region,
            )
        )
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: Dict[str, Any]) -> Player:
        """Create and flush a new Player to PostgreSQL.

        Args:
            db (AsyncSession): Background database instance.
            obj_in (Dict[str, Any]): Dictionary of attributes mapping to player.

        Returns:
            Player: The persistent DB object.
        """
        db_obj = Player(**obj_in)  # type: ignore
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


class CoachingReportRepository:
    """Handles CRUD operations mapping against the CoachingReport table."""

    async def get_by_player(self, db: AsyncSession, puuid: str) -> List[CoachingReport]:
        """Get the full array of reports linked to the specified Player.

        Args:
            db (AsyncSession): The database handler.
            puuid (str): The Player's linking string identifier.

        Returns:
            List[CoachingReport]: Collection of evaluated responses.
        """
        result = await db.execute(
            select(CoachingReport).filter(CoachingReport.puuid == puuid)
        )
        return list(result.scalars().all())


player_repo = PlayerRepository()
report_repo = CoachingReportRepository()
