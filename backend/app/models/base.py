"""Database Declarative Base mapping.

This module provides the core Base for SQLAlchemy ORM models.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base model orchestrating our declarative schema definition."""

    pass
