import asyncio
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_active_user, get_current_user_from_token
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.notification import (
    NotificationResponse,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
)
from app.services.notification_service import notification_service
from app.utils.pagination import paginate
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=ApiResponse[PaginatedResponse[NotificationResponse]])
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    items, total = await notification_service.list_for_user(db, current_user.id, page=page, page_size=page_size)
    return ApiResponse(data=paginate([NotificationResponse.model_validate(i) for i in items], total, page, page_size))


@router.patch("/{notif_id}/read", response_model=ApiResponse[NotificationResponse])
async def mark_read(
    notif_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    notif = await notification_service.get_by_id(db, notif_id, current_user.id)
    if not notif:
        return ApiResponse(success=False, message="Notification not found", data=None)
    updated = await notification_service.mark_read(db, notif)
    return ApiResponse(data=NotificationResponse.model_validate(updated))


@router.patch("/read-all", response_model=ApiResponse[dict])
async def mark_all_read(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    count = await notification_service.mark_all_read(db, current_user.id)
    return ApiResponse(data={"marked": count})


@router.get("/preferences", response_model=ApiResponse[NotificationPreferencesResponse | None])
async def get_preferences(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    prefs = await notification_service.get_preferences(db, current_user.id)
    if not prefs:
        return ApiResponse(data=None)
    return ApiResponse(data=NotificationPreferencesResponse.model_validate(prefs))


@router.patch("/preferences", response_model=ApiResponse[NotificationPreferencesResponse])
async def update_preferences(
    body: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    prefs = await notification_service.upsert_preferences(db, current_user.id, **body.model_dump(exclude_unset=True))
    return ApiResponse(data=NotificationPreferencesResponse.model_validate(prefs))


@router.get("/stream")
async def notification_stream(
    current_user: User = Depends(get_current_user_from_token),
):
    from app.core.database import AsyncSessionLocal
    import json

    async def event_generator():
        last_sent_at = datetime.now(timezone.utc)
        while True:
            try:
                async with AsyncSessionLocal() as db:
                    new_list = await notification_service.get_new_since(db, current_user.id, since=last_sent_at)
                    for notif in new_list:
                        data = NotificationResponse.model_validate(notif)
                        payload = data.model_dump(mode="json")
                        yield f"data: {json.dumps(payload)}\n\n"
                    if new_list:
                        last_sent_at = max(n.created_at for n in new_list)
            except asyncio.CancelledError:
                break
            except Exception:
                pass
            await asyncio.sleep(5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
