"""
Base repository — shared Supabase PostgREST CRUD helpers.
"""

from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel

from app.db.client import get_supabase_client

T = TypeVar("T", bound=BaseModel)


class RepositoryError(Exception):
    """Raised when a Supabase operation fails."""


class BaseRepository(Generic[T]):
    table_name: str
    record_model: type[T]

    def __init__(self, client: Any | None = None) -> None:
        self._client = client or get_supabase_client()
        if self._client is None:
            raise RepositoryError(
                "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
            )

    @property
    def table(self):
        return self._client.table(self.table_name)

    def _one(self, response) -> dict[str, Any]:
        if getattr(response, "error", None):
            raise RepositoryError(str(response.error))
        data = response.data
        if not data:
            raise RepositoryError(f"No data returned from {self.table_name}")
        if isinstance(data, list):
            return data[0]
        return data

    def _many(self, response) -> list[dict[str, Any]]:
        if getattr(response, "error", None):
            raise RepositoryError(str(response.error))
        return response.data or []

    def _optional_one(self, response) -> dict[str, Any] | None:
        if getattr(response, "error", None):
            raise RepositoryError(str(response.error))
        data = response.data
        if not data:
            return None
        if isinstance(data, list):
            return data[0] if data else None
        return data

    def _to_record(self, row: dict[str, Any]) -> T:
        return self.record_model.model_validate(row)

    def create(self, payload: BaseModel) -> T:
        row = self._one(self.table.insert(payload.model_dump(mode="json", exclude_none=True)).execute())
        return self._to_record(row)

    def get_by_id(self, record_id: UUID) -> T | None:
        rows = self._many(
            self.table.select("*").eq("id", str(record_id)).limit(1).execute(),
        )
        return self._to_record(rows[0]) if rows else None

    def list_all(self, *, limit: int = 100, offset: int = 0) -> list[T]:
        rows = self._many(
            self.table.select("*").order("created_at", desc=True).range(offset, offset + limit - 1).execute(),
        )
        return [self._to_record(row) for row in rows]

    def update(self, record_id: UUID, payload: BaseModel) -> T:
        data = payload.model_dump(mode="json", exclude_none=True)
        if not data:
            existing = self.get_by_id(record_id)
            if not existing:
                raise RepositoryError(f"{self.table_name} record not found: {record_id}")
            return existing
        row = self._one(self.table.update(data).eq("id", str(record_id)).execute())
        return self._to_record(row)

    def delete(self, record_id: UUID) -> None:
        response = self.table.delete().eq("id", str(record_id)).execute()
        if getattr(response, "error", None):
            raise RepositoryError(str(response.error))
