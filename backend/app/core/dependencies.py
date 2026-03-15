from collections.abc import AsyncGenerator
from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import verify_token
from app.core.exceptions import UnauthorizedError, ForbiddenError, UpgradeRequiredError
from app.models.user import User
from app.services.subscription_service import subscription_service


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError("Missing or invalid authorization header")
    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = verify_token(token)
    except ValueError as e:
        raise UnauthorizedError(str(e))
    if payload.type != "access":
        raise UnauthorizedError("Invalid token type")
    result = await db.execute(select(User).where(User.id == UUID(payload.sub)))
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedError("User not found")
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.is_suspended:
        raise ForbiddenError("Account is suspended")
    if not current_user.is_active:
        raise ForbiddenError("Account is inactive")
    return current_user


async def get_current_user_from_token(
    token: Annotated[str | None, Query(alias="token")] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> User:
    """Get current user from query param token (for SSE where EventSource cannot send headers)."""
    if not token or not token.strip():
        raise UnauthorizedError("Missing token")
    try:
        payload = verify_token(token.strip())
    except ValueError as e:
        raise UnauthorizedError(str(e))
    if payload.type != "access":
        raise UnauthorizedError("Invalid token type")
    result = await db.execute(select(User).where(User.id == UUID(payload.sub)))
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedError("User not found")
    if user.is_suspended or not user.is_active:
        raise ForbiddenError("Account is suspended or inactive")
    return user


async def get_optional_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = verify_token(token)
    except ValueError:
        return None
    if payload.type != "access":
        return None
    result = await db.execute(select(User).where(User.id == UUID(payload.sub)))
    return result.scalar_one_or_none()


def require_role(*allowed_roles: str):
    async def role_check(
        current_user: Annotated[User, Depends(get_current_active_user)],
    ) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenError(f"Role '{current_user.role}' not allowed for this action")
        return current_user

    return role_check


def check_subscription(feature: str):
    """Dependency factory: require active subscription for the given feature."""

    async def subscription_check(
        current_user: Annotated[User, Depends(get_current_active_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> User:
        allowed, upgrade_url = await subscription_service.check_feature(db, current_user.id, feature)
        if not allowed:
            raise UpgradeRequiredError(
                message="Upgrade required",
                upgrade_url=upgrade_url or "/pricing",
                feature=feature,
            )
        return current_user

    return subscription_check
