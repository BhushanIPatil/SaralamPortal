from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    verify_google_token,
    GoogleUserInfo,
)
from app.core.config import settings
from app.models.user import User


class AuthService:
    async def register(
        self, db: AsyncSession, email: str, password: str, full_name: str, phone: str | None = None
    ) -> User:
        existing = await db.execute(select(User).where(User.email == email))
        if existing.scalar_one_or_none():
            raise ValueError("Email already registered")
        if phone:
            existing_phone = await db.execute(select(User).where(User.phone == phone))
            if existing_phone.scalar_one_or_none():
                raise ValueError("Phone already registered")
        user = User(
            email=email,
            phone=phone,
            password_hash=hash_password(password),
            full_name=full_name,
            role="seeker",
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    async def login(self, db: AsyncSession, email: str, password: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not user.password_hash:
            return None
        if not verify_password(password, user.password_hash):
            return None
        user.last_login_at = datetime.now(timezone.utc)
        await db.flush()
        return user

    def tokens_for_user(self, user: User) -> dict:
        data = {"sub": str(user.id), "role": user.role, "email": user.email}
        access = create_access_token(data)
        refresh = create_refresh_token(data)
        return {
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60,
        }

    async def refresh(self, db: AsyncSession, refresh_token: str) -> User | None:
        try:
            payload = verify_token(refresh_token)
        except ValueError:
            return None
        if payload.type != "refresh":
            return None
        result = await db.execute(select(User).where(User.id == UUID(payload.sub)))
        return result.scalar_one_or_none()

    async def google_login_or_register(
        self, db: AsyncSession, id_token: str
    ) -> User:
        info = await verify_google_token(id_token)
        result = await db.execute(select(User).where(User.google_id == info.sub))
        user = result.scalar_one_or_none()
        if user:
            user.last_login_at = datetime.now(timezone.utc)
            user.email = info.email
            if info.name:
                user.full_name = info.name
            if info.picture:
                user.profile_picture_url = info.picture
            user.is_email_verified = info.email_verified
            await db.flush()
            await db.refresh(user)
            return user
        result = await db.execute(select(User).where(User.email == info.email))
        existing = result.scalar_one_or_none()
        if existing:
            existing.google_id = info.sub
            existing.last_login_at = datetime.now(timezone.utc)
            if info.name:
                existing.full_name = info.name
            if info.picture:
                existing.profile_picture_url = info.picture
            existing.is_email_verified = info.email_verified
            await db.flush()
            await db.refresh(existing)
            return existing
        user = User(
            email=info.email,
            google_id=info.sub,
            full_name=info.name or info.email,
            profile_picture_url=info.picture,
            is_email_verified=info.email_verified,
            role="seeker",
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user


auth_service = AuthService()
