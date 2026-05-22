"""
Supabase client singleton (service role — server-side only).
"""

from functools import lru_cache
from typing import Any

from app.config import settings


def is_supabase_configured() -> bool:
    return bool(settings.supabase_url and settings.supabase_service_role_key)


@lru_cache
def get_supabase_client() -> Any | None:
    if not is_supabase_configured():
        return None

    try:
        from supabase import create_client
    except ImportError as exc:
        raise ImportError(
            "Install the Supabase SDK: pip install supabase",
        ) from exc

    return create_client(settings.supabase_url, settings.supabase_service_role_key)
