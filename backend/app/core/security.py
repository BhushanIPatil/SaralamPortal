from datetime import datetime, timedelta, timezone
from typing import Any
import httpx
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenData(BaseModel):
    sub: str  # user_id
    role: str
    exp: datetime
    type: str  # "access" | "refresh"
    email: str | None = None


class GoogleUserInfo(BaseModel):
    sub: str  # google id
    email: str
    email_verified: bool
    name: str | None = None
    picture: str | None = None


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def verify_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        sub = payload.get("sub")
        role = payload.get("role", "seeker")
        exp_ts = payload.get("exp")
        token_type = payload.get("type", "access")
        email = payload.get("email")
        if not sub:
            raise JWTError("missing sub")
        return TokenData(
            sub=str(sub),
            role=role,
            exp=datetime.fromtimestamp(exp_ts, tz=timezone.utc) if exp_ts else datetime.now(timezone.utc),
            type=token_type,
            email=email,
        )
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def verify_google_token(id_token: str) -> GoogleUserInfo:
    if not settings.google_client_id:
        raise ValueError("Google OAuth not configured")
    url = "https://oauth2.googleapis.com/tokeninfo"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params={"id_token": id_token})
        resp.raise_for_status()
        data = resp.json()
    if data.get("aud") != settings.google_client_id:
        raise ValueError("Invalid audience")
    return GoogleUserInfo(
        sub=data["sub"],
        email=data["email"],
        email_verified=data.get("email_verified", False),
        name=data.get("name"),
        picture=data.get("picture"),
    )
