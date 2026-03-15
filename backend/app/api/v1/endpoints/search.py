from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.service import ServiceCategoryResponse, ServiceListResponse
from app.schemas.job import JobListResponse
from app.schemas.user import ProviderSearchResponse
from app.services.service_service import service_service
from app.services.job_service import job_service
from app.services.user_service import user_service
from app.utils.pagination import paginate

router = APIRouter(tags=["public"])


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


@router.get("/search")
async def global_search(
    q: str = Query("", min_length=0),
    type: str = Query("jobs", description="jobs | services | providers"),
    category: UUID | None = Query(None, alias="category_id"),
    city: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    if type == "services":
        items, total = await service_service.search(
            db, q or "", category_id=category, page=page, page_size=page_size
        )
        return ApiResponse(
            data=paginate([ServiceListResponse.model_validate(i) for i in items], total, page, page_size)
        )
    if type == "providers":
        items, total = await user_service.search_providers(db, q or "", page=page, page_size=page_size)
        return ApiResponse(
            data=paginate([ProviderSearchResponse.model_validate(i) for i in items], total, page, page_size)
        )
    # default: jobs
    items, total = await job_service.search(
        db, q or "", category_id=category, page=page, page_size=page_size
    )
    return ApiResponse(
        data=paginate([JobListResponse.model_validate(i) for i in items], total, page, page_size)
    )
