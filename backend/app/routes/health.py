"""
Health check — use this to confirm the API is running.
"""

from fastapi import APIRouter

from app.config import settings
from app.db.client import is_supabase_configured
from app.schemas.upload import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        debug=settings.debug,
        environment=settings.environment,
        supabase_connected=is_supabase_configured(),
        gemini_configured=bool(settings.gemini_api_key),
    )
