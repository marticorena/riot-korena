"""FastAPI dependencies injected into route handlers.

This module provides reusable dependencies such as database sessions
and authentication context to ensure DRY principles across endpoints.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provides a database session per HTTP request.

    Yields:
        AsyncSession: An asynchronous SQLAlchemy session connected to the database.
    """
    async with AsyncSessionLocal() as session:
        yield session
