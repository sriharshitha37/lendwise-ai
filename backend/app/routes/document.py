"""
Document upload and PDF extraction endpoints.
"""

from fastapi import APIRouter, File, Header, UploadFile

from app.config import settings
from app.schemas.extraction import ExtractedDocument
from app.schemas.upload import UploadDocumentResponse
from app.services.extraction_service import (
    extract_from_saved_filename,
    extract_from_upload,
)
from app.services.pdf_service import save_pdf_upload
from app.services.storage_service import persist_extraction

router = APIRouter()


@router.post("/upload-document", response_model=UploadDocumentResponse)
async def upload_document(
    file: UploadFile = File(..., description="PDF document to upload"),
) -> UploadDocumentResponse:
    result = await save_pdf_upload(file)
    return UploadDocumentResponse(filename=result["filename"])


@router.post("/extract-document", response_model=ExtractedDocument)
async def extract_document(
    file: UploadFile = File(..., description="PDF to extract identity fields from"),
    x_user_id: str | None = Header(None, alias="X-User-Id"),
) -> ExtractedDocument:
    """Upload a PDF and return extracted Name, DOB, PAN, Aadhaar, and Address as JSON."""
    source_name = file.filename
    extracted = await extract_from_upload(file)
    await persist_extraction(
        extracted,
        user_id=x_user_id,
        default_user_email=settings.default_user_email,
        source_filename=source_name,
    )
    return extracted


@router.post("/extract-document/{filename}", response_model=ExtractedDocument)
async def extract_saved_document(
    filename: str,
    x_user_id: str | None = Header(None, alias="X-User-Id"),
) -> ExtractedDocument:
    """Extract fields from a PDF already stored in uploads/."""
    extracted = await extract_from_saved_filename(filename)
    await persist_extraction(
        extracted,
        user_id=x_user_id,
        default_user_email=settings.default_user_email,
        saved_filename=filename,
    )
    return extracted