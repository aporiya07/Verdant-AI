"""
Application configuration using Pydantic Settings.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application-wide settings loaded from environment variables.
    """
    gemini_api_key: str = ""
    primary_model: str = "gemini-2.5-flash"
    fallback_model: str = "gemini-3.5-flash"
    database_url: str = "sqlite:///./verdant.db"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
