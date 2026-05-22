"""
Extract identity fields from PDFs using the Google Gemini API.
"""

import asyncio
import json
from pathlib import Path

from fastapi import HTTPException, UploadFile
from google import genai
from google.genai import types

from app.config import settings
from app.schemas.extraction import ExtractedDocument
from app.services.pdf_service import PDF_CONTENT_TYPES

EXTRACTION_PROMPT = """You are extracting identity information from an Indian KYC or financial PDF.

Extract these fields if clearly present in the document:
- name: full legal name
- dob: date of birth (prefer DD/MM/YYYY)
- pan: 10-character PAN (format ABCDE1234F)
- aadhaar: 12-digit Aadhaar number (digits only, no spaces)
- address: complete postal address as one string

Use null for any field that is missing, illegible, or uncertain.
Return ONLY valid JSON with exactly these keys: name, dob, pan, aadhaar, address.
Do not wrap in markdown or add extra keys."""


def _validate_pdf_bytes(filename: str | None, content_type: str | None, size: int) -> None:
    if not filename or not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    mime = (content_type or "").lower()
    if mime and mime not in PDF_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {mime}. Expected a PDF.",
        )

    if size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if size > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.max_upload_mb} MB.",
        )


def _mock_extracted_document() -> ExtractedDocument:
    """Demo data when Gemini is unavailable (quota, API errors, missing key)."""
    return ExtractedDocument(
        name="Demo User",
        dob="01/01/2000",
        aadhaar="XXXX XXXX XXXX",
        pan="ABCDE1234F",
        address="Demo Address",
        source="fallback_mock",
    )


def _parse_extraction_response(text: str) -> ExtractedDocument:
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("Gemini response was not a JSON object.")

    data["source"] = "gemini"
    return ExtractedDocument.model_validate(data)


def _extract_sync(pdf_bytes: bytes) -> ExtractedDocument:
    if not settings.gemini_api_key:
        return _mock_extracted_document()

    try:
        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[
                types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                EXTRACTION_PROMPT,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        if not response.text:
            return _mock_extracted_document()

        return _parse_extraction_response(response.text)
    except Exception:
        # Quota exceeded, API errors, invalid JSON, network issues, etc.
        return _mock_extracted_document()


async def extract_from_pdf_bytes(pdf_bytes: bytes) -> ExtractedDocument:
    """Extract fields from raw PDF bytes."""
    return await asyncio.to_thread(_extract_sync, pdf_bytes)


async def extract_from_pdf_path(file_path: Path) -> ExtractedDocument:
    """Extract fields from a PDF already saved in uploads/."""
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="PDF file not found.")

    if file_path.suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = file_path.read_bytes()
    _validate_pdf_bytes(file_path.name, "application/pdf", len(pdf_bytes))
    return await extract_from_pdf_bytes(pdf_bytes)


async def extract_from_upload(file: UploadFile) -> ExtractedDocument:
    """Validate an uploaded PDF and extract identity fields."""
    content = await file.read()
    _validate_pdf_bytes(file.filename, file.content_type, len(content))
    return await extract_from_pdf_bytes(content)


async def extract_from_saved_filename(filename: str) -> ExtractedDocument:
    """Extract fields from a PDF previously saved under uploads/."""
    safe_name = Path(filename).name
    if safe_name != filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

    file_path = settings.upload_path / safe_name
    return await extract_from_pdf_path(file_path)
