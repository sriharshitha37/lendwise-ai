"""
Business logic for PDF uploads (validation, saving to disk).

Routes stay thin; they call functions here.
"""

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.config import settings

PDF_CONTENT_TYPES = {
    "application/pdf",
    "application/x-pdf",
}


def _validate_pdf(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in PDF_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {content_type}. Expected a PDF.",
        )


async def save_pdf_upload(file: UploadFile) -> dict:
    """
    Validate the upload, enforce size limits, and write the file to uploads/.

    Returns metadata used by the route to build the API response.
    """
    _validate_pdf(file)

    content = await file.read()
    size = len(content)

    if size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if size > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.max_upload_mb} MB.",
        )

    # Unique name avoids overwriting files with the same original name
    safe_stem = Path(file.filename).stem.replace(" ", "_")[:80]
    unique_name = f"{safe_stem}_{uuid.uuid4().hex[:8]}.pdf"
    destination: Path = settings.upload_path / unique_name

    destination.write_bytes(content)

    return {
        "filename": unique_name,
        "saved_path": str(destination.relative_to(settings.upload_path.parent)),
        "size_bytes": size,
    }
