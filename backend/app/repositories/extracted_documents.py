from uuid import UUID

from app.repositories.base import BaseRepository
from app.schemas.database import (
    ExtractedDocumentCreate,
    ExtractedDocumentRecord,
    ExtractedDocumentUpdate,
)


class ExtractedDocumentRepository(BaseRepository[ExtractedDocumentRecord]):
    table_name = "extracted_documents"
    record_model = ExtractedDocumentRecord

    def list_by_user(self, user_id: UUID, *, limit: int = 50) -> list[ExtractedDocumentRecord]:
        rows = self._many(
            self.table.select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .limit(limit)
            .execute(),
        )
        return [self._to_record(row) for row in rows]

    def list_by_loan_application(
        self,
        loan_application_id: UUID,
    ) -> list[ExtractedDocumentRecord]:
        rows = self._many(
            self.table.select("*")
            .eq("loan_application_id", str(loan_application_id))
            .order("created_at", desc=True)
            .execute(),
        )
        return [self._to_record(row) for row in rows]

    def create_document(self, payload: ExtractedDocumentCreate) -> ExtractedDocumentRecord:
        return self.create(payload)

    def update_document(
        self,
        document_id: UUID,
        payload: ExtractedDocumentUpdate,
    ) -> ExtractedDocumentRecord:
        return self.update(document_id, payload)
