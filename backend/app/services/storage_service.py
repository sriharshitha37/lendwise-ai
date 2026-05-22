"""
Persist API outcomes to Supabase (repository orchestration).

Failures are logged and swallowed so the API still responds if the database is unavailable.
"""

import asyncio
import logging
from uuid import UUID, uuid4

from app.db.client import is_supabase_configured
from app.repositories.chat_history import ChatHistoryRepository
from app.repositories.extracted_documents import ExtractedDocumentRepository
from app.repositories.loan_applications import LoanApplicationRepository
from app.repositories.users import UserRepository
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.database import (
    ChatMessageCreate,
    ExtractedDocumentCreate,
    LoanApplicationCreate,
    UserCreate,
)
from app.schemas.eligibility import EligibilityRequest, EligibilityResponse
from app.schemas.extraction import ExtractedDocument

logger = logging.getLogger(__name__)


def _parse_uuid(value: str | None) -> UUID | None:
    if not value:
        return None
    try:
        return UUID(value)
    except ValueError:
        logger.warning("Invalid UUID ignored: %s", value)
        return None


class StorageService:
    def __init__(self) -> None:
        self._users = UserRepository()
        self._loans = LoanApplicationRepository()
        self._documents = ExtractedDocumentRepository()
        self._chat = ChatHistoryRepository()

    def resolve_user_id(self, user_id: str | None, *, default_email: str) -> UUID | None:
        explicit = _parse_uuid(user_id)
        if explicit:
            user = self._users.get_by_id(explicit)
            return user.id if user else explicit

        if default_email:
            existing = self._users.get_by_email(default_email)
            if existing:
                return existing.id
            created = self._users.create_user(
                UserCreate(email=default_email, full_name="Demo Applicant"),
            )
            return created.id
        return None

    def save_eligibility_result(
        self,
        request: EligibilityRequest,
        response: EligibilityResponse,
        *,
        user_id: str | None,
        default_user_email: str,
    ) -> UUID | None:
        uid = self.resolve_user_id(user_id, default_email=default_user_email)
        record = self._loans.create_application(
            LoanApplicationCreate(
                user_id=uid,
                income=request.income,
                credit_score=request.credit_score,
                employment_type=request.employment_type.value,
                approval_status=response.approval_status.value,
                risk_score=response.risk_score,
                reason=response.reason,
            ),
        )
        return record.id

    def save_extracted_document(
        self,
        extracted: ExtractedDocument,
        *,
        user_id: str | None,
        default_user_email: str,
        source_filename: str | None = None,
        saved_filename: str | None = None,
        loan_application_id: str | None = None,
    ) -> UUID | None:
        uid = self.resolve_user_id(user_id, default_email=default_user_email)
        record = self._documents.create_document(
            ExtractedDocumentCreate(
                user_id=uid,
                loan_application_id=_parse_uuid(loan_application_id),
                source_filename=source_filename,
                saved_filename=saved_filename,
                name=extracted.name,
                dob=extracted.dob,
                pan=extracted.pan,
                aadhaar=extracted.aadhaar,
                address=extracted.address,
                source=extracted.source,
            ),
        )
        return record.id

    def save_chat_turn(
        self,
        request: ChatRequest,
        response: ChatResponse,
        *,
        user_id: str | None,
        default_user_email: str,
    ) -> UUID:
        uid = self.resolve_user_id(user_id, default_email=default_user_email)
        session_id = _parse_uuid(request.session_id) or uuid4()

        self._chat.create_message(
            ChatMessageCreate(
                user_id=uid,
                session_id=session_id,
                role="user",
                content=request.message,
            ),
        )
        self._chat.create_message(
            ChatMessageCreate(
                user_id=uid,
                session_id=session_id,
                role="assistant",
                content=response.reply,
            ),
        )
        return session_id

    def link_upload_filename(
        self,
        loan_application_id: UUID,
        filename: str,
    ) -> None:
        from app.schemas.database import LoanApplicationUpdate

        self._loans.update_application(
            loan_application_id,
            LoanApplicationUpdate(uploaded_filename=filename),
        )


def get_storage_service() -> StorageService | None:
    if not is_supabase_configured():
        return None
    try:
        return StorageService()
    except Exception as exc:
        logger.exception("Failed to initialize StorageService: %s", exc)
        return None


async def persist_eligibility(
    request: EligibilityRequest,
    response: EligibilityResponse,
    *,
    user_id: str | None,
    default_user_email: str,
) -> None:
    service = get_storage_service()
    if not service:
        return

    def _run():
        service.save_eligibility_result(
            request,
            response,
            user_id=user_id,
            default_user_email=default_user_email,
        )

    try:
        await asyncio.to_thread(_run)
    except Exception as exc:
        logger.exception("Failed to persist eligibility to Supabase: %s", exc)


async def persist_extraction(
    extracted: ExtractedDocument,
    *,
    user_id: str | None,
    default_user_email: str,
    source_filename: str | None = None,
    saved_filename: str | None = None,
    loan_application_id: str | None = None,
) -> None:
    service = get_storage_service()
    if not service:
        return

    def _run():
        service.save_extracted_document(
            extracted,
            user_id=user_id,
            default_user_email=default_user_email,
            source_filename=source_filename,
            saved_filename=saved_filename,
            loan_application_id=loan_application_id,
        )

    try:
        await asyncio.to_thread(_run)
    except Exception as exc:
        logger.exception("Failed to persist extraction to Supabase: %s", exc)
