from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_active_user, require_role
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.rating import RatingCreate, RatingResponse, RatingRespondRequest
from app.services.rating_service import rating_service
from app.utils.pagination import paginate
from app.models.user import User

router = APIRouter(prefix="/ratings", tags=["ratings"])


@router.post("", response_model=ApiResponse[RatingResponse])
async def create_rating(
    body: RatingCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    r = await rating_service.create(
        db,
        reviewer_id=current_user.id,
        reviewee_id=body.reviewee_id,
        rating=body.rating,
        job_id=body.job_id,
        application_id=body.application_id,
        title=body.title,
        review_text=body.review_text,
        tags=body.tags,
    )
    return ApiResponse(data=RatingResponse.model_validate(r))


@router.get("/provider/{provider_id}", response_model=ApiResponse[PaginatedResponse[RatingResponse]])
async def list_provider_ratings(
    provider_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await rating_service.list_for_provider(db, provider_id, page=page, page_size=page_size)
    return ApiResponse(data=paginate([RatingResponse.model_validate(i) for i in items], total, page, page_size))


@router.post("/{rating_id}/respond", response_model=ApiResponse[dict])
async def respond_to_rating(
    rating_id: UUID,
    body: RatingRespondRequest,
    current_user: User = Depends(require_role("provider")),
    db: AsyncSession = Depends(get_db),
):
    await rating_service.respond(db, rating_id, current_user.id, body.response_text)
    return ApiResponse(message="Response added")
