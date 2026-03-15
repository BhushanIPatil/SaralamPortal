from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job, JobMedia
from app.core.exceptions import NotFoundError
from app.utils.pagination import offset_for_page, clamp_page_size


class JobService:
    async def list_jobs(
        self,
        db: AsyncSession,
        status: str | None = "open",
        category_id: UUID | None = None,
        page: int = 1,
        page_size: int | None = None,
    ) -> tuple[list[Job], int]:
        size = clamp_page_size(page_size)
        offset = offset_for_page(page, size)
        q = select(Job).where(Job.is_active == True)
        if status:
            q = q.where(Job.status == status)
        if category_id:
            q = q.where(Job.category_id == category_id)
        count_q = select(func.count(Job.id)).where(Job.is_active == True)
        if status:
            count_q = count_q.where(Job.status == status)
        if category_id:
            count_q = count_q.where(Job.category_id == category_id)
        total = (await db.execute(count_q)).scalar() or 0
        q = q.order_by(Job.created_at.desc()).offset(offset).limit(size)
        result = await db.execute(q)
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, job_id: UUID) -> Job | None:
        result = await db.execute(
            select(Job).where(Job.id == job_id, Job.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_my_jobs(self, db: AsyncSession, seeker_id: UUID) -> list[Job]:
        result = await db.execute(
            select(Job).where(Job.seeker_id == seeker_id, Job.is_active == True)
        )
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, seeker_id: UUID, **kwargs) -> Job:
        job = Job(seeker_id=seeker_id, **kwargs)
        db.add(job)
        await db.flush()
        await db.refresh(job)
        return job

    async def update(self, db: AsyncSession, job: Job, **kwargs) -> Job:
        for k, v in kwargs.items():
            if hasattr(job, k) and v is not None:
                setattr(job, k, v)
        await db.flush()
        await db.refresh(job)
        return job

    async def cancel(self, db: AsyncSession, job: Job) -> None:
        job.status = "cancelled"
        await db.flush()

    async def search(
        self,
        db: AsyncSession,
        query: str,
        category_id: UUID | None = None,
        page: int = 1,
        page_size: int | None = None,
    ) -> tuple[list[Job], int]:
        size = clamp_page_size(page_size)
        offset = offset_for_page(page, size)
        q = select(Job).where(Job.is_active == True, Job.status == "open")
        count_q = select(func.count(Job.id)).where(Job.is_active == True, Job.status == "open")
        if query and query.strip() and query != "%":
            like = f"%{query.strip()}%"
            q = q.where(or_(Job.title.ilike(like), Job.description.ilike(like)))
            count_q = count_q.where(or_(Job.title.ilike(like), Job.description.ilike(like)))
        if category_id:
            q = q.where(Job.category_id == category_id)
            count_q = count_q.where(Job.category_id == category_id)
        total = (await db.execute(count_q)).scalar() or 0
        q = q.order_by(Job.created_at.desc()).offset(offset).limit(size)
        result = await db.execute(q)
        return list(result.scalars().all()), total


job_service = JobService()
