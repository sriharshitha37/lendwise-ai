"""
AI loan assistant powered by Google Gemini.
"""

import asyncio

from fastapi import HTTPException
from google import genai
from google.genai import types

from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse

LOAN_ASSISTANT_SYSTEM = """You are LendWise AI, a professional and friendly loan assistant for customers in India.

Help users with:
- Personal and home loan basics (eligibility, documents, timelines)
- KYC documents (PAN, Aadhaar, address proof)
- Credit scores and how they affect approval
- EMI estimates and repayment concepts
- Application steps and common questions

Guidelines:
- Be clear, concise, and supportive.
- Use simple language; avoid unnecessary jargon.
- Never guarantee loan approval or specific interest rates.
- Encourage users to verify terms with their lender before applying.
- Do not provide legal or tax advice; suggest consulting a professional when needed.
- If the question is unrelated to loans or finance, politely steer back to lending topics."""


def _get_client() -> genai.Client:
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not set. Add it to backend/.env",
        )
    return genai.Client(api_key=settings.gemini_api_key)


def _build_contents(request: ChatRequest) -> list[types.Content]:
    contents: list[types.Content] = []

    for msg in request.history:
        role = "user" if msg.role == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg.content)],
            )
        )

    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=request.message)],
        )
    )
    return contents


def _chat_sync(request: ChatRequest) -> ChatResponse:
    client = _get_client()

    try:
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=_build_contents(request),
            config=types.GenerateContentConfig(
                system_instruction=LOAN_ASSISTANT_SYSTEM,
            ),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {exc}",
        ) from exc

    if not response.text:
        raise HTTPException(status_code=502, detail="Gemini returned an empty response.")

    return ChatResponse(reply=response.text.strip())


async def chat_with_assistant(request: ChatRequest) -> ChatResponse:
    """Send a message (and optional history) to the loan assistant."""
    return await asyncio.to_thread(_chat_sync, request)
