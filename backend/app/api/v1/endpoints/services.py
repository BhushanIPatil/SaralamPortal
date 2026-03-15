from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_active_user, require_role
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.service import (
    ServiceCategoryResponse,
    ServiceListResponse,
    ServiceDetailResponse,
    ServiceCreate,
    ServiceUpdate,
)
from app.services.service_service import service_service
from app.utils.pagination import paginate
from app.models.user import User

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/categories", response_model=ApiResponse[list[ServiceCategoryResponse]])
async def list_categories(db: AsyncSession = Depends(get_db)):
    categories = await service_service.get_categories_hierarchy(db)
    def to_resp(c):
        return ServiceCategoryResponse(
            id=c.id, name=c.name, slug=c.slug, description=c.description,
            icon_url=c.icon_url, parent_category_id=c.parent_category_id,
            sort_order=c.sort_order, is_featured=c.is_featured,
            children=[to_resp(ch) for ch in getattr(c, "children", [])],
        )
    return ApiResponse(data=[to_resp(c) for c in categories])


@router.get("", response_model=ApiResponse[PaginatedResponse[ServiceListResponse]])
async def list_services(
    category_id: UUID | None = None,
    city: str | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    rating_min: float | None = None,
    sort_by: str = Query("created_at", enum=["created_at", "rating", "price"]),
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await service_service.list_services(
        db, category_id=category_id, city=city,
        price_min=price_min, price_max=price_max, rating_min=rating_min,
        sort_by=sort_by, page=page, page_size=page_size,
    )
    return ApiResponse(data=paginate([ServiceListResponse.model_validate(i) for i in items], total, page, page_size))


@router.get("/my", response_model=ApiResponse[list[ServiceListResponse]])
async def my_services(
    current_user: User = Depends(require_role("provider")),
    db: AsyncSession = Depends(get_db),
):
    items = await service_service.get_my_services(db, current_user.id)
    return ApiResponse(data=[ServiceListResponse.model_validate(i) for i in items])


@router.get("/{service_id}", response_model=ApiResponse[ServiceDetailResponse])
async def get_service(
    service_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    svc = await service_service.get_by_id(db, service_id)
    if not svc:
        return ApiResponse(success=False, message="Service not found", data=None)
    return ApiResponse(data=ServiceDetailResponse.model_validate(svc))


@router.post("", response_model=ApiResponse[ServiceDetailResponse])
async def create_service(
    body: ServiceCreate,
    current_user: User = Depends(require_role("provider")),
    db: AsyncSession = Depends(get_db),
):
    svc = await service_service.create(db, current_user.id, **body.model_dump())
    return ApiResponse(data=ServiceDetailResponse.model_validate(svc))


@router.patch("/{service_id}", response_model=ApiResponse[ServiceDetailResponse])
async def update_service(
    service_id: UUID,
    body: ServiceUpdate,
    current_user: User = Depends(require_role("provider")),
    db: AsyncSession = Depends(get_db),
):
    svc = await service_service.get_by_id(db, service_id)
    if not svc or svc.provider_id != current_user.id:
        return ApiResponse(success=False, message="Service not found", data=None)
    updated = await service_service.update(db, svc, **body.model_dump(exclude_unset=True))
    return ApiResponse(data=ServiceDetailResponse.model_validate(updated))


@router.delete("/{service_id}", response_model=ApiResponse[None])
async def deactivate_service(
    service_id: UUID,
    current_user: User = Depends(require_role("provider")),
    db: AsyncSession = Depends(get_db),
):
    svc = await service_service.get_by_id(db, service_id)
    if not svc or svc.provider_id != current_user.id:
        return ApiResponse(success=False, message="Service not found", data=None)
    await service_service.deactivate(db, svc)
    return ApiResponse(message="Service deactivated")
