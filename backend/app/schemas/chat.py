"""
Chat request and response models for the loan assistant.
"""

from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message to the loan assistant")
    history: list[ChatMessage] = Field(
        default_factory=list,
        description="Optional prior turns (user/assistant pairs)",
    )
    session_id: str | None = Field(
        default=None,
        description="Optional UUID to group messages in chat_history",
    )
    user_id: str | None = Field(
        default=None,
        description="Optional user UUID (links to users table)",
    )


class ChatResponse(BaseModel):
    reply: str = Field(description="Assistant response")
    session_id: str | None = Field(
        default=None,
        description="Conversation session id when persisted to Supabase",
    )
