from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.utils.pagination import offset_for_page, clamp_page_size, paginate

from app.core.dependencies import get_db, require_role
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.service import ServiceListResponse
from app.models.service import Service
from app.models.user import User

router = APIRouter(prefix="/services", tags=["admin"])


@router.get("", response_model=ApiResponse[PaginatedResponse[ServiceListResponse]])
async def list_services(
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    size = clamp_page_size(page_size)
    offset = offset_for_page(page, size)
    q = select(Service)
    total = (await db.execute(select(func.count(Service.id)))).scalar() or 0
    q = q.offset(offset).limit(size)
    result = await db.execute(q)
    items = result.scalars().all()
    return ApiResponse(data=paginate([ServiceListResponse.model_validate(s) for s in items], total, page, size))


@router.patch("/{service_id}/verify", response_model=ApiResponse[ServiceListResponse])
async def verify_service(
    service_id: UUID,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    svc = result.scalar_one_or_none()
    if not svc:
        return ApiResponse(success=False, message="Service not found", data=None)
    svc.is_verified = True
    await db.flush()
    await db.refresh(svc)
    return ApiResponse(data=ServiceListResponse.model_validate(svc))
