"""
AI loan assistant chat endpoint.
"""

import asyncio
from uuid import uuid4

from fastapi import APIRouter

from app.config import settings
from app.db.client import is_supabase_configured
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import chat_with_assistant
from app.services.storage_service import get_storage_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Chat with the LendWise AI loan assistant."""
    result = await chat_with_assistant(request)

    session_id: str | None = request.session_id
    if is_supabase_configured():
        service = get_storage_service()
        if service:

            def _persist():
                return str(
                    service.save_chat_turn(
                        request,
                        result,
                        user_id=request.user_id,
                        default_user_email=settings.default_user_email,
                    ),
                )

            try:
                session_id = await asyncio.to_thread(_persist)
            except Exception:
                session_id = request.session_id or str(uuid4())

    return ChatResponse(reply=result.reply, session_id=session_id)
