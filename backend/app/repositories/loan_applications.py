from uuid import UUID

from app.repositories.base import BaseRepository
from app.schemas.database import (
    LoanApplicationCreate,
    LoanApplicationRecord,
    LoanApplicationUpdate,
)


class LoanApplicationRepository(BaseRepository[LoanApplicationRecord]):
    table_name = "loan_applications"
    record_model = LoanApplicationRecord

    def list_by_user(self, user_id: UUID, *, limit: int = 50) -> list[LoanApplicationRecord]:
        rows = self._many(
            self.table.select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .limit(limit)
            .execute(),
        )
        return [self._to_record(row) for row in rows]

    def create_application(self, payload: LoanApplicationCreate) -> LoanApplicationRecord:
        return self.create(payload)

    def update_application(
        self,
        application_id: UUID,
        payload: LoanApplicationUpdate,
    ) -> LoanApplicationRecord:
        return self.update(application_id, payload)
