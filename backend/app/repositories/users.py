from uuid import UUID

from app.repositories.base import BaseRepository
from app.schemas.database import UserCreate, UserRecord, UserUpdate


class UserRepository(BaseRepository[UserRecord]):
    table_name = "users"
    record_model = UserRecord

    def get_by_email(self, email: str) -> UserRecord | None:
        rows = self._many(
            self.table.select("*").eq("email", email).limit(1).execute(),
        )
        return self._to_record(rows[0]) if rows else None

    def create_user(self, payload: UserCreate) -> UserRecord:
        return self.create(payload)

    def update_user(self, user_id: UUID, payload: UserUpdate) -> UserRecord:
        return self.update(user_id, payload)
