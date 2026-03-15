from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.dependencies import get_db, require_role
from app.schemas.base import ApiResponse
from app.models.user import User
from app.models.subscription import UserSubscription, Payment

router = APIRouter(prefix="/analytics", tags=["admin"])


@router.get("", response_model=ApiResponse[dict])
async def analytics(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    total_revenue = await db.execute(
        select(func.sum(Payment.amount)).where(Payment.status == "success")
    )
    rev = total_revenue.scalar()
    active_subs = await db.execute(
        select(func.count(UserSubscription.id)).where(UserSubscription.status == "active")
    )
    return ApiResponse(data={
        "total_revenue": float(rev or 0),
        "active_subscriptions": active_subs.scalar() or 0,
    })
