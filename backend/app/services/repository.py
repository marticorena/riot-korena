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

    async def update(
        self, db: AsyncSession, *, db_obj: Player, obj_in: Dict[str, Any]
    ) -> Player:
        """Update an existing player with new data.

        Args:
            db (AsyncSession): Background database instance.
            db_obj (Player): The existing database object.
            obj_in (Dict[str, Any]): Dictionary of updated attributes.

        Returns:
            Player: The updated persistent DB object.
        """
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


class CoachingReportRepository:
    """Handles CRUD operations mapping against the CoachingReport table.
    
    TODO(improvement): We currently heavily rely on storing nested heuristics 
    inside PostgeSQL JSONB fields within this table. For long-term scale and 
    advanced dashboard analytics, we should break out individual match frames 
    and timeline habits into normalized relational tables.
    """

    async def get_by_player(self, db: AsyncSession, puuid: str, role: Optional[str] = None) -> List[CoachingReport]:
        """Get the full array of reports linked to the specified Player.

        Args:
            db (AsyncSession): The database handler.
            puuid (str): The Player's linking string identifier.
            role (Optional[str]): Filters strictly to reports grading a specific lane.

        Returns:
            List[CoachingReport]: Collection of evaluated responses.
        """
        query = select(CoachingReport).filter(CoachingReport.puuid == puuid)
        if role:
            query = query.filter(CoachingReport.role == role)
        
        query = query.order_by(CoachingReport.generated_at.desc())
        
        result = await db.execute(query)
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, *, obj_in: Dict[str, Any]) -> CoachingReport:
        """Create and flush a new CoachingReport to PostgreSQL.

        Args:
            db (AsyncSession): Background database instance.
            obj_in (Dict[str, Any]): Dictionary of attributes mapping to report.

        Returns:
            CoachingReport: The persistent DB object.
        """
        db_obj = CoachingReport(**obj_in)  # type: ignore
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


player_repo = PlayerRepository()
report_repo = CoachingReportRepository()
