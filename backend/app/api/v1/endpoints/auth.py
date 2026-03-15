from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_active_user
from app.schemas.base import ApiResponse
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    AuthUserResponse,
)
from app.services.auth_service import auth_service
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


def _token_response(user: User, tokens: dict) -> TokenResponse:
    return TokenResponse(
        **tokens,
        user=AuthUserResponse(
            id=str(user.id),
            name=user.full_name or "",
            email=user.email or "",
            role=user.role or "seeker",
            avatar=user.profile_picture_url,
            subscription_status=None,
        ),
    )


@router.post("/register", response_model=ApiResponse[TokenResponse])
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await auth_service.register(
        db, body.email, body.password, body.full_name, body.phone
    )
    tokens = auth_service.tokens_for_user(user)
    return ApiResponse(data=_token_response(user, tokens), message="Registered successfully")


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await auth_service.login(db, body.email, body.password)
    if not user:
        return ApiResponse(success=False, message="Invalid email or password", data=None)
    tokens = auth_service.tokens_for_user(user)
    return ApiResponse(data=_token_response(user, tokens))


@router.post("/google", response_model=ApiResponse[TokenResponse])
async def google_auth(body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await auth_service.google_login_or_register(db, body.id_token)
    except ValueError as e:
        return ApiResponse(success=False, message=str(e), data=None)
    tokens = auth_service.tokens_for_user(user)
    return ApiResponse(data=_token_response(user, tokens))


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    user = await auth_service.refresh(db, body.refresh_token)
    if not user:
        return ApiResponse(success=False, message="Invalid refresh token", data=None)
    tokens = auth_service.tokens_for_user(user)
    return ApiResponse(data=_token_response(user, tokens))


@router.post("/logout", response_model=ApiResponse[None])
async def logout(current_user: User = Depends(get_current_active_user)):
    return ApiResponse(message="Logged out (client should discard tokens)")


@router.post("/forgot-password", response_model=ApiResponse[None])
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    return ApiResponse(message="If the email exists, a reset link has been sent")


@router.post("/reset-password", response_model=ApiResponse[None])
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    return ApiResponse(message="Password reset not implemented (store token and verify)")
