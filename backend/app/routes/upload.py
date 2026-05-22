"""
PDF upload endpoint.
"""

from fastapi import APIRouter, File, UploadFile

from app.schemas.upload import UploadResponse
from app.services.pdf_service import save_pdf_upload

router = APIRouter()


@router.post("/pdf", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(..., description="PDF file to upload"),
) -> UploadResponse:
    result = await save_pdf_upload(file)
    return UploadResponse(
        message="PDF uploaded successfully",
        filename=result["filename"],
        saved_path=result["saved_path"],
        size_bytes=result["size_bytes"],
    )
