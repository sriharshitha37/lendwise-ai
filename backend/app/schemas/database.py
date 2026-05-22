"""
Pydantic models for Supabase table records (repository layer).
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

EmploymentTypeDb = Literal["salaried", "self_employed", "contract", "unemployed"]
ApprovalStatusDb = Literal["approved", "pending", "rejected"]
ChatRoleDb = Literal["user", "assistant"]


class UserCreate(BaseModel):
    email: str | None = None
    full_name: str | None = None


class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None


class UserRecord(BaseModel):
    id: UUID
    email: str | None = None
    full_name: str | None = None
    created_at: datetime
    updated_at: datetime


class LoanApplicationCreate(BaseModel):
    user_id: UUID | None = None
    income: float
    credit_score: int
    employment_type: EmploymentTypeDb
    approval_status: ApprovalStatusDb | None = None
    risk_score: int | None = None
    reason: str | None = None
    uploaded_filename: str | None = None


class LoanApplicationUpdate(BaseModel):
    income: float | None = None
    credit_score: int | None = None
    employment_type: EmploymentTypeDb | None = None
    approval_status: ApprovalStatusDb | None = None
    risk_score: int | None = None
    reason: str | None = None
    uploaded_filename: str | None = None


class LoanApplicationRecord(BaseModel):
    id: UUID
    user_id: UUID | None = None
    income: float
    credit_score: int
    employment_type: EmploymentTypeDb
    approval_status: ApprovalStatusDb | None = None
    risk_score: int | None = None
    reason: str | None = None
    uploaded_filename: str | None = None
    created_at: datetime
    updated_at: datetime


class ExtractedDocumentCreate(BaseModel):
    user_id: UUID | None = None
    loan_application_id: UUID | None = None
    source_filename: str | None = None
    saved_filename: str | None = None
    name: str | None = None
    dob: str | None = None
    pan: str | None = None
    aadhaar: str | None = None
    address: str | None = None
    source: str = Field(default="gemini")


class ExtractedDocumentUpdate(BaseModel):
    loan_application_id: UUID | None = None
    source_filename: str | None = None
    saved_filename: str | None = None
    name: str | None = None
    dob: str | None = None
    pan: str | None = None
    aadhaar: str | None = None
    address: str | None = None
    source: str | None = None


class ExtractedDocumentRecord(BaseModel):
    id: UUID
    user_id: UUID | None = None
    loan_application_id: UUID | None = None
    source_filename: str | None = None
    saved_filename: str | None = None
    name: str | None = None
    dob: str | None = None
    pan: str | None = None
    aadhaar: str | None = None
    address: str | None = None
    source: str
    created_at: datetime


class ChatMessageCreate(BaseModel):
    user_id: UUID | None = None
    session_id: UUID
    role: ChatRoleDb
    content: str


class ChatMessageRecord(BaseModel):
    id: UUID
    user_id: UUID | None = None
    session_id: UUID
    role: ChatRoleDb
    content: str
    created_at: datetime
