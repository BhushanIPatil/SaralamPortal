from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.dependencies import get_db, require_role
from app.schemas.base import ApiResponse
from app.models.user import User
from app.models.job import Job
from app.models.service import Service
from app.models.subscription import UserSubscription, Payment

router = APIRouter(prefix="/dashboard", tags=["admin"])


@router.get("", response_model=ApiResponse[dict])
async def dashboard(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    users = await db.execute(select(func.count(User.id)))
    jobs = await db.execute(select(func.count(Job.id)))
    services = await db.execute(select(func.count(Service.id)))
    subs = await db.execute(select(func.count(UserSubscription.id)).where(UserSubscription.status == "active"))
    return ApiResponse(data={
        "total_users": users.scalar() or 0,
        "total_jobs": jobs.scalar() or 0,
        "total_services": services.scalar() or 0,
        "active_subscriptions": subs.scalar() or 0,
    })
