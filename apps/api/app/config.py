"""Application configuration using pydantic-settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/verdant"
    supabase_url: str = ""
    supabase_anon_key: str = ""

    # Auth
    jwt_secret: str = "changeme-in-production-use-256-bit-secret"
    jwt_algorithm: str = "HS256"
    jwt_expiry_days: int = 7

    # Gemini
    gemini_api_key: str = ""
    gemini_model_primary: str = "gemini-3.5-flash"
    gemini_model_fallback: str = "gemini-3.1-flash-lite"
    gemini_timeout_secs: int = 8

    # App
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    environment: str = "development"
    demo_user_email: str = "demo@verdant.ai"
    demo_user_password: str = "demo-verdant-2026"


settings = Settings()
