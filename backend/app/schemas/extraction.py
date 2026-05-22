"""
Structured fields extracted from KYC / identity PDFs.
"""

from pydantic import BaseModel, Field


class ExtractedDocument(BaseModel):
    name: str | None = Field(default=None, description="Full legal name")
    dob: str | None = Field(default=None, description="Date of birth")
    pan: str | None = Field(default=None, description="PAN number")
    aadhaar: str | None = Field(default=None, description="Aadhaar number (12 digits)")
    address: str | None = Field(default=None, description="Full postal address")
    source: str = Field(
        default="gemini",
        description='Data origin: "gemini" or "fallback_mock"',
    )
