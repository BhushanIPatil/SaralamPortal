"""
Auth API tests: register, login, Google OAuth, token refresh.
Uses mocked DB session; auth_service is exercised via app endpoints.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4


@pytest.mark.asyncio
async def test_register_success(client):
    """POST /api/v1/auth/register returns tokens and success."""
    from app.models.user import User

    fake_user = MagicMock(spec=User)
    fake_user.id = uuid4()
    fake_user.email = "test@example.com"
    fake_user.role = "seeker"

    with patch("app.api.v1.endpoints.auth.auth_service") as svc:
        svc.register = AsyncMock(return_value=fake_user)
        svc.tokens_for_user = MagicMock(
            return_value={
                "access_token": "eyJfake",
                "refresh_token": "eyJrefresh",
                "token_type": "bearer",
                "expires_in": 3600,
            }
        )
        r = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "password1234",
                "full_name": "Test User",
            },
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is True
    assert "data" in data
    assert data["data"]["access_token"]
    assert data["data"]["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Register with existing email returns error."""
    with patch("app.api.v1.endpoints.auth.auth_service") as svc:
        svc.register = AsyncMock(side_effect=ValueError("Email already registered"))
        r = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "existing@example.com",
                "password": "password1234",
                "full_name": "Test",
            },
        )
    assert r.status_code in (200, 400)
    data = r.json()
    assert data.get("success") is False
    assert "already" in data.get("message", "").lower() or "email" in data.get("message", "").lower()


@pytest.mark.asyncio
async def test_login_success(client):
    """POST /api/v1/auth/login returns tokens."""
    from app.models.user import User

    fake_user = MagicMock(spec=User)
    fake_user.id = uuid4()
    fake_user.email = "u@example.com"
    fake_user.role = "seeker"

    with patch("app.api.v1.endpoints.auth.auth_service") as svc:
        svc.login = AsyncMock(return_value=fake_user)
        svc.tokens_for_user = MagicMock(
            return_value={
                "access_token": "eyJaccess",
                "refresh_token": "eyJrefresh",
                "token_type": "bearer",
                "expires_in": 3600,
            }
        )
        r = await client.post(
            "/api/v1/auth/login",
            json={"email": "u@example.com", "password": "pass12345"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is True
    assert data["data"]["access_token"]


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    """Login with wrong password returns error."""
    with patch("app.api.v1.endpoints.auth.auth_service") as svc:
        svc.login = AsyncMock(return_value=None)
        r = await client.post(
            "/api/v1/auth/login",
            json={"email": "u@example.com", "password": "wrong"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is False
    assert data.get("data") is None


@pytest.mark.asyncio
async def test_refresh_success(client):
    """POST /api/v1/auth/refresh returns new tokens."""
    from app.models.user import User

    fake_user = MagicMock(spec=User)
    fake_user.id = uuid4()
    fake_user.email = "u@example.com"
    fake_user.role = "seeker"

    with patch("app.api.v1.endpoints.auth.auth_service") as svc:
        svc.refresh = AsyncMock(return_value=fake_user)
        svc.tokens_for_user = MagicMock(
            return_value={
                "access_token": "new_access",
                "refresh_token": "new_refresh",
                "token_type": "bearer",
                "expires_in": 3600,
            }
        )
        r = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "valid_refresh_token"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is True
    assert data["data"]["access_token"]


@pytest.mark.asyncio
async def test_refresh_invalid_token(client):
    """Refresh with invalid token returns error."""
    with patch("app.api.v1.endpoints.auth.auth_service") as svc:
        svc.refresh = AsyncMock(return_value=None)
        r = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid"},
        )
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is False
