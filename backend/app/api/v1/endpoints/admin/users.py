from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.utils.pagination import offset_for_page, clamp_page_size, paginate

from app.core.dependencies import get_db, require_role
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.user import UserMeResponse
from app.models.user import User

router = APIRouter(prefix="/users", tags=["admin"])


@router.get("", response_model=ApiResponse[PaginatedResponse[UserMeResponse]])
async def list_users(
    role: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    size = clamp_page_size(page_size)
    offset = offset_for_page(page, size)
    q = select(User).where(User.is_active == True)
    if role:
        q = q.where(User.role == role)
    count_q = select(func.count(User.id)).where(User.is_active == True)
    if role:
        count_q = count_q.where(User.role == role)
    total = (await db.execute(count_q)).scalar() or 0
    q = q.offset(offset).limit(size)
    result = await db.execute(q)
    items = result.scalars().all()
    return ApiResponse(data=paginate([UserMeResponse.model_validate(u) for u in items], total, page, size))


@router.patch("/{user_id}/suspend", response_model=ApiResponse[UserMeResponse])
async def suspend_user(
    user_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return ApiResponse(success=False, message="User not found", data=None)
    user.is_suspended = True
    await db.flush()
    await db.refresh(user)
    return ApiResponse(data=UserMeResponse.model_validate(user))
