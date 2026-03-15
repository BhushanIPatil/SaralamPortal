from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.core.exceptions import UpgradeRequiredError
from app.services.subscription_service import subscription_service
from app.schemas.base import ApiResponse, PaginatedResponse
from app.schemas.job import JobListResponse, JobDetailResponse, JobCreate, JobUpdate
from app.services.job_service import job_service
from app.utils.pagination import paginate
from app.models.user import User

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=ApiResponse[PaginatedResponse[JobListResponse]])
async def list_jobs(
    status: str | None = Query("open"),
    category_id: UUID | None = None,
    page: int = Query(1, ge=1),
    page_size: int | None = Query(None, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await job_service.list_jobs(db, status=status, category_id=category_id, page=page, page_size=page_size)
    return ApiResponse(data=paginate([JobListResponse.model_validate(i) for i in items], total, page, page_size))


@router.get("/my", response_model=ApiResponse[list[JobListResponse]])
async def my_jobs(
    current_user: User = Depends(require_role("seeker")),
    db: AsyncSession = Depends(get_db),
):
    items = await job_service.get_my_jobs(db, current_user.id)
    return ApiResponse(data=[JobListResponse.model_validate(i) for i in items])


@router.get("/{job_id}", response_model=ApiResponse[JobDetailResponse])
async def get_job(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    job = await job_service.get_by_id(db, job_id)
    if not job:
        return ApiResponse(success=False, message="Job not found", data=None)
    return ApiResponse(data=JobDetailResponse.model_validate(job))


@router.post("", response_model=ApiResponse[JobDetailResponse])
async def create_job(
    body: JobCreate,
    current_user: User = Depends(require_role("seeker")),
    db: AsyncSession = Depends(get_db),
):
    allowed, upgrade_url = await subscription_service.check_feature(db, current_user.id, "job_posting")
    if not allowed:
        raise UpgradeRequiredError(message="Upgrade required", upgrade_url=upgrade_url or "/pricing", feature="job_posting")
    job = await job_service.create(db, current_user.id, **body.model_dump())
    return ApiResponse(data=JobDetailResponse.model_validate(job))


@router.patch("/{job_id}", response_model=ApiResponse[JobDetailResponse])
async def update_job(
    job_id: UUID,
    body: JobUpdate,
    current_user: User = Depends(require_role("seeker")),
    db: AsyncSession = Depends(get_db),
):
    job = await job_service.get_by_id(db, job_id)
    if not job or job.seeker_id != current_user.id:
        return ApiResponse(success=False, message="Job not found", data=None)
    updated = await job_service.update(db, job, **body.model_dump(exclude_unset=True))
    return ApiResponse(data=JobDetailResponse.model_validate(updated))


@router.delete("/{job_id}", response_model=ApiResponse[None])
async def cancel_job(
    job_id: UUID,
    current_user: User = Depends(require_role("seeker")),
    db: AsyncSession = Depends(get_db),
):
    job = await job_service.get_by_id(db, job_id)
    if not job or job.seeker_id != current_user.id:
        return ApiResponse(success=False, message="Job not found", data=None)
    await job_service.cancel(db, job)
    return ApiResponse(message="Job cancelled")
