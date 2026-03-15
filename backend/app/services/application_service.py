from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import JobApplication
from app.models.job import Job
from app.core.exceptions import NotFoundError, ForbiddenError


class ApplicationService:
    async def apply(
        self,
        db: AsyncSession,
        job_id: UUID,
        applicant_id: UUID,
        service_id: UUID | None = None,
        cover_letter: str | None = None,
        proposed_price: float | None = None,
        proposed_timeline: str | None = None,
    ) -> JobApplication:
        job = await db.execute(select(Job).where(Job.id == job_id, Job.is_active == True))
        job = job.scalar_one_or_none()
        if not job:
            raise NotFoundError("Job not found")
        if job.status != "open":
            raise ForbiddenError("Job is not accepting applications")
        if job.seeker_id == applicant_id:
            raise ForbiddenError("Cannot apply to your own job")
        existing = await db.execute(
            select(JobApplication).where(
                JobApplication.job_id == job_id, JobApplication.applicant_id == applicant_id
            )
        )
        if existing.scalar_one_or_none():
            raise ForbiddenError("Already applied")
        app = JobApplication(
            job_id=job_id,
            applicant_id=applicant_id,
            service_id=service_id,
            cover_letter=cover_letter,
            proposed_price=proposed_price,
            proposed_timeline=proposed_timeline,
            status="pending",
        )
        db.add(app)
        await db.flush()
        await db.refresh(app)
        return app

    async def list_for_job(self, db: AsyncSession, job_id: UUID, seeker_id: UUID) -> list[JobApplication]:
        job = await db.execute(select(Job).where(Job.id == job_id))
        job = job.scalar_one_or_none()
        if not job or job.seeker_id != seeker_id:
            return []
        result = await db.execute(
            select(JobApplication).where(JobApplication.job_id == job_id)
        )
        return list(result.scalars().all())

    async def get_my_applications(self, db: AsyncSession, applicant_id: UUID) -> list[JobApplication]:
        result = await db.execute(
            select(JobApplication).where(JobApplication.applicant_id == applicant_id)
        )
        return list(result.scalars().all())

    async def get_by_id(self, db: AsyncSession, app_id: UUID) -> JobApplication | None:
        result = await db.execute(select(JobApplication).where(JobApplication.id == app_id))
        return result.scalar_one_or_none()

    async def update_status(
        self, db: AsyncSession, app: JobApplication, status: str, seeker_id: UUID
    ) -> JobApplication:
        job = await db.execute(select(Job).where(Job.id == app.job_id))
        job = job.scalar_one_or_none()
        if not job or job.seeker_id != seeker_id:
            raise ForbiddenError("Not allowed to update this application")
        if status not in ("shortlisted", "rejected", "accepted"):
            raise ValueError("Invalid status")
        app.status = status
        app.is_read_by_seeker = True
        await db.flush()
        await db.refresh(app)
        return app

    async def withdraw(self, db: AsyncSession, app: JobApplication, applicant_id: UUID) -> None:
        if app.applicant_id != applicant_id:
            raise ForbiddenError("Not your application")
        if app.status not in ("pending", "shortlisted"):
            raise ForbiddenError("Cannot withdraw")
        app.status = "withdrawn"
        await db.flush()


application_service = ApplicationService()
