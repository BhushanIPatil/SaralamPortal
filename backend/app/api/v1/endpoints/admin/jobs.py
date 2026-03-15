from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.utils.pagination import offset_for_page, clamp_page_size, paginate

from app.core.dependencies import get_db, require_role
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.job import JobListResponse
from app.models.job import Job
from app.models.user import User

router = APIRouter(prefix="/jobs", tags=["admin"])


@router.get("", response_model=ApiResponse[PaginatedResponse[JobListResponse]])
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    size = clamp_page_size(page_size)
    offset = offset_for_page(page, size)
    q = select(Job)
    total = (await db.execute(select(func.count(Job.id)))).scalar() or 0
    q = q.offset(offset).limit(size)
    result = await db.execute(q)
    items = result.scalars().all()
    return ApiResponse(data=paginate([JobListResponse.model_validate(j) for j in items], total, page, size))
