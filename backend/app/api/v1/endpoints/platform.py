from fastapi import APIRouter, Depends

from app.core.dependencies import get_db
from app.schemas.base import ApiResponse
from app.schemas.platform import PlatformInfoResponse, PlatformStatsResponse
from app.services.platform_service import platform_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/platform", tags=["platform"])


@router.get("/info", response_model=ApiResponse[PlatformInfoResponse])
async def platform_info(db: AsyncSession = Depends(get_db)):
    data = await platform_service.get_info(db)
    return ApiResponse(data=PlatformInfoResponse(**data))


@router.get("/stats", response_model=ApiResponse[PlatformStatsResponse])
async def platform_stats(db: AsyncSession = Depends(get_db)):
    data = await platform_service.get_public_stats(db)
    return ApiResponse(data=PlatformStatsResponse(**data))
