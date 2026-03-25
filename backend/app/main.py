"""
Main FastAPI entry point for the Support Coach MVP.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title="Support Coach Core",
    description="Backend API for League of Legends coaching heuristics",
    version="1.0.0",
)

# CORS Configuration
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
async def health_check():
    """Basic health check endpoint to verify API routing."""
    return {"status": "ok", "service": "support-coach-api"}
