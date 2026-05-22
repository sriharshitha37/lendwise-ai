"""
Load settings from environment variables (and optional .env file).

Run the API from the `backend/` folder so paths resolve correctly.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ — one level above this file's package (app/)
BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "LendWise API"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"

    # Comma-separated allowed origins (no trailing slashes).
    # Production example: https://lendwise.vercel.app,https://lendwise-git-main.vercel.app
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    upload_dir: str = "uploads"
    max_upload_mb: int = 10

    # Google Gemini — https://aistudio.google.com/apikey
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Supabase — https://supabase.com/dashboard (use service role key on server only)
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    default_user_email: str = "demo@lendwise.local"

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        if self.environment == "production" and "*" in origins:
            # Avoid accidental wildcard in production
            return [o for o in origins if o != "*"]
        return origins

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in {"production", "prod"}

    @property
    def upload_path(self) -> Path:
        path = BACKEND_DIR / self.upload_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
