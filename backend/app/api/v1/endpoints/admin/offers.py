from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.core.dependencies import get_db, require_role
from app.schemas.base import ApiResponse
from app.models.subscription import SubscriptionOffer, SubscriptionPlan
from app.models.user import User

router = APIRouter(prefix="/offers", tags=["admin"])


class OfferCreate(BaseModel):
    plan_id: UUID
    offer_name: str = Field(..., max_length=255)
    offer_code: str = Field(..., max_length=50)
    discount_type: str = Field(..., pattern="^(percent|flat|free)$")
    discount_value: float = 0
    valid_from: date | None = None
    valid_until: date | None = None
    max_redemptions: int | None = None


class OfferUpdate(BaseModel):
    offer_name: str | None = None
    discount_value: float | None = None
    valid_from: date | None = None
    valid_until: date | None = None
    max_redemptions: int | None = None
    is_active: bool | None = None


@router.post("", response_model=ApiResponse[dict])
async def create_offer(
    body: OfferCreate,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    plan = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == body.plan_id))
    plan = plan.scalar_one_or_none()
    if not plan:
        return ApiResponse(success=False, message="Plan not found", data=None)
    offer = SubscriptionOffer(
        plan_id=body.plan_id,
        offer_name=body.offer_name,
        offer_code=body.offer_code,
        discount_type=body.discount_type,
        discount_value=body.discount_value,
        valid_from=body.valid_from,
        valid_until=body.valid_until,
        max_redemptions=body.max_redemptions,
        created_by=current_user.id,
    )
    db.add(offer)
    await db.flush()
    await db.refresh(offer)
    return ApiResponse(data={"id": str(offer.id), "offer_code": offer.offer_code})


@router.patch("/{offer_id}", response_model=ApiResponse[dict])
async def update_offer(
    offer_id: UUID,
    body: OfferUpdate,
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SubscriptionOffer).where(SubscriptionOffer.id == offer_id))
    offer = result.scalar_one_or_none()
    if not offer:
        return ApiResponse(success=False, message="Offer not found", data=None)
    for k, v in body.model_dump(exclude_unset=True).items():
        if hasattr(offer, k):
            setattr(offer, k, v)
    await db.flush()
    return ApiResponse(data={"id": str(offer.id)})
