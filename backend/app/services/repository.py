from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.domain import CoachingReport, Player


class PlayerRepository:
    async def get_by_puuid(self, db: AsyncSession, puuid: str) -> Optional[Player]:
        result = await db.execute(select(Player).filter(Player.puuid == puuid))
        return result.scalars().first()

    async def get_by_riot_id(
        self, db: AsyncSession, game_name: str, tag_line: str, region: str
    ) -> Optional[Player]:
        result = await db.execute(
            select(Player).filter(
                Player.game_name == game_name,
                Player.tag_line == tag_line,
                Player.region == region,
            )
        )
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: dict) -> Player:
        db_obj = Player(**obj_in)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


class CoachingReportRepository:
    async def get_by_player(self, db: AsyncSession, puuid: str) -> List[CoachingReport]:
        result = await db.execute(
            select(CoachingReport).filter(CoachingReport.puuid == puuid)
        )
        return list(result.scalars().all())


player_repo = PlayerRepository()
report_repo = CoachingReportRepository()
