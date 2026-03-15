from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.utils.pagination import offset_for_page, clamp_page_size, paginate

from app.core.dependencies import get_db, require_role
from app.schemas.base import ApiResponse, PaginatedResponse
from app.models.subscription import UserSubscription
from app.models.user import User

router = APIRouter(prefix="/subscriptions", tags=["admin"])


@router.get("", response_model=ApiResponse[PaginatedResponse[dict]])
async def list_subscriptions(
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    size = clamp_page_size(page_size)
    offset = offset_for_page(page, size)
    q = select(UserSubscription)
    total = (await db.execute(select(func.count(UserSubscription.id)))).scalar() or 0
    q = q.offset(offset).limit(size)
    result = await db.execute(q)
    items = result.scalars().all()
    data = [{"id": str(s.id), "user_id": str(s.user_id), "status": s.status, "start_date": str(s.start_date), "end_date": str(s.end_date)} for s in items]
    return ApiResponse(data=paginate(data, total, page, size))
