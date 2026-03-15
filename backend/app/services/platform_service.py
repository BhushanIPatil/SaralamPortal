from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.platform import PlatformSetting, AppMetadata
from app.models.user import User
from app.models.service import Service
from app.models.job import Job


class PlatformService:
    async def get_info(self, db: AsyncSession) -> dict:
        launched = datetime.strptime(settings.app_launched_date, "%Y-%m-%d").replace(
            tzinfo=timezone.utc
        )
        days = (datetime.now(timezone.utc) - launched).days
        stats = await self._get_cached_stats(db)
        return {
            "app_name": settings.app_name,
            "app_version": settings.app_version,
            "days_since_launch": max(0, days),
            "total_providers": stats.get("total_providers"),
            "total_seekers": stats.get("total_seekers"),
            "total_jobs": stats.get("total_jobs"),
            "total_cities": stats.get("total_cities"),
        }

    async def get_public_stats(self, db: AsyncSession) -> dict:
        providers = await db.execute(
            select(func.count(User.id)).where(User.role == "provider", User.is_active == True)
        )
        seekers = await db.execute(
            select(func.count(User.id)).where(User.role == "seeker", User.is_active == True)
        )
        jobs = await db.execute(select(func.count(Job.id)).where(Job.is_active == True))
        return {
            "total_providers": providers.scalar() or 0,
            "total_seekers": seekers.scalar() or 0,
            "total_jobs": jobs.scalar() or 0,
            "total_cities": 0,
            "featured_categories": [],
        }

    async def _get_cached_stats(self, db: AsyncSession) -> dict:
        result = await db.execute(select(AppMetadata).where(AppMetadata.is_active == True))
        rows = result.scalars().all()
        return {r.stat_key: r.stat_value for r in rows}


platform_service = PlatformService()
