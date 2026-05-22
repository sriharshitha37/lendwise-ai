"""
FastAPI application entry point.

Run from the backend/ directory:
  uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Interactive docs: http://127.0.0.1:8000/docs
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import api_router

# Load .env before settings are read (pydantic-settings also reads .env)
load_dotenv()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    description="LendWise backend API — health checks and PDF uploads.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root() -> dict:
    """Quick pointer to useful URLs."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "docs": "/docs",
        "health": "/health",
        "upload_document": "/upload-document",
        "chat": "/chat",
        "eligibility": "/eligibility",
        "extract_document": "/extract-document",
        "upload_pdf": "/upload/pdf",
    }
