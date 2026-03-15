from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.utils.pagination import offset_for_page, clamp_page_size, paginate

from app.core.dependencies import get_db, require_role
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.rating import RatingResponse
from app.models.rating import Rating
from app.models.user import User

router = APIRouter(prefix="/ratings", tags=["admin"])


@router.get("", response_model=ApiResponse[PaginatedResponse[RatingResponse]])
async def list_ratings(
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    size = clamp_page_size(page_size)
    offset = offset_for_page(page, size)
    q = select(Rating)
    total = (await db.execute(select(func.count(Rating.id)))).scalar() or 0
    q = q.offset(offset).limit(size)
    result = await db.execute(q)
    items = result.scalars().all()
    return ApiResponse(data=paginate([RatingResponse.model_validate(r) for r in items], total, page, size))
