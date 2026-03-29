"""API v1 router definition.

This module aggregates all defined endpoint routers into a single
v1 API router.
"""

from fastapi import APIRouter

from app.api.api_v1.endpoints import matches, players, reports

api_router = APIRouter()
api_router.include_router(players.router, prefix="/players", tags=["Players"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(matches.router, prefix="/matches", tags=["Matches"])
