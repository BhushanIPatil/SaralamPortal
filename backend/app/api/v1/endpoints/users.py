from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_active_user, get_optional_user
from app.schemas.base import ApiResponse
from app.schemas.user import (
    UserMeResponse,
    UserMeUpdate,
    UserProfileResponse,
    AddressBase,
    AddressResponse,
    UserPublicResponse,
)
from app.services.user_service import user_service
from app.services.storage_service import storage_service
from app.services.subscription_service import subscription_service
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=ApiResponse[UserMeResponse])
async def get_me(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_me(db, current_user.id)
    return ApiResponse(data=UserMeResponse.model_validate(user))


@router.patch("/me", response_model=ApiResponse[UserMeResponse])
async def update_me(
    body: UserMeUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.update_me(
        db, current_user, full_name=body.full_name, phone=body.phone
    )
    return ApiResponse(data=UserMeResponse.model_validate(user))


@router.post("/me/avatar", response_model=ApiResponse[dict])
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    content = await file.read()
    url = await storage_service.save_avatar(content, file.filename or "avatar", str(current_user.id))
    return ApiResponse(data={"url": url})


@router.get("/me/addresses", response_model=ApiResponse[list[AddressResponse]])
async def list_addresses(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    addrs = await user_service.get_addresses(db, current_user.id)
    return ApiResponse(data=[AddressResponse.model_validate(a) for a in addrs])


@router.post("/me/addresses", response_model=ApiResponse[AddressResponse])
async def add_address(
    body: AddressBase,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    addr = await user_service.add_address(
        db,
        current_user.id,
        address_type=body.address_type,
        address_line1=body.address_line1,
        address_line2=body.address_line2,
        city=body.city,
        state=body.state,
        country=body.country,
        pincode=body.pincode,
        latitude=body.latitude,
        longitude=body.longitude,
        is_primary=body.is_primary,
    )
    return ApiResponse(data=AddressResponse.model_validate(addr))


@router.patch("/me/addresses/{address_id}", response_model=ApiResponse[AddressResponse])
async def update_address(
    address_id: UUID,
    body: AddressBase,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    addr = await user_service.get_address(db, address_id, current_user.id)
    updated = await user_service.update_address(
        db, addr,
        address_type=body.address_type,
        address_line1=body.address_line1,
        address_line2=body.address_line2,
        city=body.city,
        state=body.state,
        country=body.country,
        pincode=body.pincode,
        latitude=body.latitude,
        longitude=body.longitude,
        is_primary=body.is_primary,
    )
    return ApiResponse(data=AddressResponse.model_validate(updated))


@router.delete("/me/addresses/{address_id}", response_model=ApiResponse[None])
async def delete_address(
    address_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    addr = await user_service.get_address(db, address_id, current_user.id)
    await user_service.delete_address(db, addr)
    return ApiResponse(message="Address deleted")


@router.get("/{user_id}/public", response_model=ApiResponse[UserPublicResponse])
async def get_public_profile(
    user_id: UUID,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_by_id(db, user_id)
    if not user:
        return ApiResponse(success=False, message="User not found", data=None)
    can_view_contact = False
    if current_user:
        can_view_contact, _ = await subscription_service.check_feature(db, current_user.id, "view_contact")
    data = UserPublicResponse(
        id=user.id,
        full_name=user.full_name,
        profile_picture_url=user.profile_picture_url,
        role=user.role,
        profile=UserProfileResponse.model_validate(user.profiles) if user.profiles else None,
    )
    return ApiResponse(data=data)
