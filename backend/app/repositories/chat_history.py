from uuid import UUID

from app.repositories.base import BaseRepository
from app.schemas.database import ChatMessageCreate, ChatMessageRecord


class ChatHistoryRepository(BaseRepository[ChatMessageRecord]):
    table_name = "chat_history"
    record_model = ChatMessageRecord

    def create_message(self, payload: ChatMessageCreate) -> ChatMessageRecord:
        return self.create(payload)

    def list_by_session(self, session_id: UUID, *, limit: int = 200) -> list[ChatMessageRecord]:
        rows = self._many(
            self.table.select("*")
            .eq("session_id", str(session_id))
            .order("created_at", desc=False)
            .limit(limit)
            .execute(),
        )
        return [self._to_record(row) for row in rows]

    def list_by_user(self, user_id: UUID, *, limit: int = 100) -> list[ChatMessageRecord]:
        rows = self._many(
            self.table.select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .limit(limit)
            .execute(),
        )
        return [self._to_record(row) for row in rows]

    def delete_session(self, session_id: UUID) -> None:
        self._many(self.table.delete().eq("session_id", str(session_id)).execute())
