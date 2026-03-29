"""Application configuration and environment variables management.

This module uses Pydantic Settings to load and validate environment
variables required by the application.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings class.

    Attributes:
        PROJECT_NAME (str): The name of the project.
        API_V1_STR (str): The path prefix for API v1 routes.
        DATABASE_URL (str): The connection string for the database.
        RIOT_API_KEY (str): API key for accessing Riot Games services.
    """

    PROJECT_NAME: str = "Support Coach MVP"
    API_V1_STR: str = "/api/v1"

    # DB settings
    DATABASE_URL: str = (
        "postgresql+asyncpg://korena:password@localhost:5432/support_coach"
    )

    # Riot API Configuration
    RIOT_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
