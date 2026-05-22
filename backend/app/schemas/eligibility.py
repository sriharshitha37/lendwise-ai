"""
Loan eligibility request and response models.
"""

from enum import Enum

from pydantic import BaseModel, Field


class EmploymentType(str, Enum):
    SALARIED = "salaried"
    SELF_EMPLOYED = "self_employed"
    CONTRACT = "contract"
    UNEMPLOYED = "unemployed"


class ApprovalStatus(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"


class EligibilityRequest(BaseModel):
    income: float = Field(..., gt=0, description="Monthly income in INR")
    credit_score: int = Field(..., ge=300, le=900, description="Credit score (300–900)")
    employment_type: EmploymentType


class EligibilityResponse(BaseModel):
    approval_status: ApprovalStatus
    risk_score: int = Field(..., ge=0, le=100, description="0 = low risk, 100 = high risk")
    reason: str
