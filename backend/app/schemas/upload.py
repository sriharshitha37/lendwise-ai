"""
Pydantic models define the shape of API request/response JSON.

FastAPI uses these for validation and automatic OpenAPI docs.
"""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(examples=["ok"])
    app_name: str
    debug: bool
    environment: str = "development"
    supabase_connected: bool = False
    gemini_configured: bool = False
    version: str = "0.1.0"


class UploadResponse(BaseModel):
    message: str
    filename: str
    saved_path: str
    size_bytes: int


class UploadDocumentResponse(BaseModel):
    filename: str = Field(description="Saved filename in the uploads folder")
