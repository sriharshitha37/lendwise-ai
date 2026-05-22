"""
Loan eligibility check endpoint.
"""

from fastapi import APIRouter, Header

from app.config import settings
from app.schemas.eligibility import EligibilityRequest, EligibilityResponse
from app.services.eligibility_service import evaluate_eligibility
from app.services.storage_service import persist_eligibility

router = APIRouter()


@router.post("/eligibility", response_model=EligibilityResponse)
async def check_eligibility(
    request: EligibilityRequest,
    x_user_id: str | None = Header(None, alias="X-User-Id"),
) -> EligibilityResponse:
    result = evaluate_eligibility(request)
    await persist_eligibility(
        request,
        result,
        user_id=x_user_id,
        default_user_email=settings.default_user_email,
    )
    return result
