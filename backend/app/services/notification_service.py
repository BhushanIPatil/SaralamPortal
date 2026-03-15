from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationPreference
from app.core.exceptions import NotFoundError
from app.utils.pagination import offset_for_page, clamp_page_size


class NotificationService:
    async def list_for_user(
        self,
        db: AsyncSession,
        user_id: UUID,
        page: int = 1,
        page_size: int | None = None,
    ) -> tuple[list[Notification], int]:
        size = clamp_page_size(page_size)
        offset = offset_for_page(page, size)
        q = select(Notification).where(Notification.user_id == user_id)
        count_q = select(func.count(Notification.id)).where(Notification.user_id == user_id)
        total = (await db.execute(count_q)).scalar() or 0
        q = q.order_by(Notification.created_at.desc()).offset(offset).limit(size)
        result = await db.execute(q)
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, notif_id: UUID, user_id: UUID) -> Notification | None:
        result = await db.execute(
            select(Notification).where(
                Notification.id == notif_id, Notification.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def mark_read(self, db: AsyncSession, notif: Notification) -> Notification:
        from datetime import datetime, timezone
        notif.is_read = True
        notif.read_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(notif)
        return notif

    async def mark_all_read(self, db: AsyncSession, user_id: UUID) -> int:
        from datetime import datetime, timezone
        result = await db.execute(
            select(Notification).where(
                Notification.user_id == user_id, Notification.is_read == False
            )
        )
        items = result.scalars().all()
        for n in items:
            n.is_read = True
            n.read_at = datetime.now(timezone.utc)
        await db.flush()
        return len(items)

    async def get_preferences(self, db: AsyncSession, user_id: UUID) -> NotificationPreference | None:
        result = await db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def upsert_preferences(
        self, db: AsyncSession, user_id: UUID, **kwargs
    ) -> NotificationPreference:
        prefs = await self.get_preferences(db, user_id)
        if not prefs:
            prefs = NotificationPreference(user_id=user_id)
            db.add(prefs)
            await db.flush()
        for k, v in kwargs.items():
            if hasattr(prefs, k) and v is not None:
                setattr(prefs, k, v)
        await db.flush()
        await db.refresh(prefs)
        return prefs

    async def get_unread_count(self, db: AsyncSession, user_id: UUID) -> int:
        q = select(func.count(Notification.id)).where(
            Notification.user_id == user_id, Notification.is_read == False
        )
        return (await db.execute(q)).scalar() or 0

    async def get_new_since(
        self, db: AsyncSession, user_id: UUID, since: datetime | None = None
    ) -> list[Notification]:
        q = select(Notification).where(Notification.user_id == user_id)
        if since:
            q = q.where(Notification.created_at > since)
        q = q.order_by(Notification.created_at.desc()).limit(50)
        result = await db.execute(q)
        return list(result.scalars().all())


notification_service = NotificationService()
