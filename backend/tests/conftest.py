"""
Pytest configuration and fixtures for Saralam backend.
Tests use mocked DB/session by default so no real DB is required.
For full integration tests with in-memory SQLite, you would need to
override database_url to sqlite+aiosqlite and use UUID-compatible types
(e.g. String(36)) in test model setup; current models use MSSQL UNIQUEIDENTIFIER.
"""
import os
import pytest
from unittest.mock import AsyncMock, MagicMock
from httpx import ASGITransport, AsyncClient

# Ensure test env doesn't require real DB for unit-style API tests
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest")
os.environ.setdefault("DB_SERVER", "localhost")
os.environ.setdefault("DB_NAME", "test_db")
os.environ.setdefault("DB_USER", "sa")
os.environ.setdefault("DB_PASSWORD", "test")


@pytest.fixture
def mock_db_session():
    """Provide a mock async DB session for dependency override."""
    session = AsyncMock()
    session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None), scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[])))))
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.flush = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    session.close = AsyncMock()
    return session


@pytest.fixture
async def client(mock_db_session):
    """Async HTTP client for the FastAPI app with overridden get_db."""
    from app.main import app
    from app.core.dependencies import get_db

    async def override_get_db():
        try:
            yield mock_db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def anyio_backend():
    return "asyncio"
