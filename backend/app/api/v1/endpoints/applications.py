from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, require_role
from app.core.exceptions import UpgradeRequiredError
from app.schemas.base import ApiResponse
from app.schemas.application import ApplyRequest, ApplicationResponse, ApplicationStatusUpdate
from app.services.application_service import application_service
from app.services.subscription_service import subscription_service
from app.models.user import User

router = APIRouter(tags=["applications"])


@router.post("/jobs/{job_id}/apply", response_model=ApiResponse[ApplicationResponse])
async def apply_to_job(
    job_id: UUID,
    body: ApplyRequest,
    current_user: User = Depends(require_role("provider")),
    db: AsyncSession = Depends(get_db),
):
    allowed, upgrade_url = await subscription_service.check_feature(db, current_user.id, "application")
    if not allowed:
        raise UpgradeRequiredError(message="Upgrade required", upgrade_url=upgrade_url or "/pricing", feature="application")
    app = await application_service.apply(
        db, job_id, current_user.id,
        service_id=body.service_id, cover_letter=body.cover_letter,
        proposed_price=body.proposed_price, proposed_timeline=body.proposed_timeline,
    )
    return ApiResponse(data=ApplicationResponse.model_validate(app))


@router.get("/jobs/{job_id}/applications", response_model=ApiResponse[list[ApplicationResponse]])
async def list_job_applications(
    job_id: UUID,
    current_user: User = Depends(require_role("seeker")),
    db: AsyncSession = Depends(get_db),
):
    items = await application_service.list_for_job(db, job_id, current_user.id)
    return ApiResponse(data=[ApplicationResponse.model_validate(i) for i in items])


@router.get("/applications/my", response_model=ApiResponse[list[ApplicationResponse]])
async def my_applications(
    current_user: User = Depends(require_role("provider")),
    db: AsyncSession = Depends(get_db),
):
    items = await application_service.get_my_applications(db, current_user.id)
    return ApiResponse(data=[ApplicationResponse.model_validate(i) for i in items])


@router.patch("/applications/{app_id}/status", response_model=ApiResponse[ApplicationResponse])
async def update_application_status(
    app_id: UUID,
    body: ApplicationStatusUpdate,
    current_user: User = Depends(require_role("seeker")),
    db: AsyncSession = Depends(get_db),
):
    app = await application_service.get_by_id(db, app_id)
    if not app:
        return ApiResponse(success=False, message="Application not found", data=None)
    updated = await application_service.update_status(db, app, body.status, current_user.id)
    return ApiResponse(data=ApplicationResponse.model_validate(updated))


@router.delete("/applications/{app_id}", response_model=ApiResponse[None])
async def withdraw_application(
    app_id: UUID,
    current_user: User = Depends(require_role("provider")),
    db: AsyncSession = Depends(get_db),
):
    app = await application_service.get_by_id(db, app_id)
    if not app:
        return ApiResponse(success=False, message="Application not found", data=None)
    await application_service.withdraw(db, app, current_user.id)
    return ApiResponse(message="Application withdrawn")
