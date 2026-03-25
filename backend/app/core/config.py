from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
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
