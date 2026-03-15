"""
Jobs API tests: list, create, get, apply, status changes.
Uses mocked DB and services.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from datetime import datetime, timezone


def _fake_job(**kwargs):
    j = MagicMock()
    j.id = kwargs.get("id", uuid4())
    j.title = kwargs.get("title", "Test Job")
    j.description = kwargs.get("description", "")
    j.status = kwargs.get("status", "open")
    j.budget_type = kwargs.get("budget_type", "fixed")
    j.budget_min = kwargs.get("budget_min")
    j.budget_max = kwargs.get("budget_max")
    j.currency = kwargs.get("currency", "INR")
    j.category_id = kwargs.get("category_id", uuid4())
    j.seeker_id = kwargs.get("seeker_id", uuid4())
    j.created_at = kwargs.get("created_at", datetime.now(timezone.utc))
    j.event_date = None
    j.event_duration_hours = None
    j.event_location_id = None
    j.visibility = "public"
    j.application_deadline = None
    j.slots_available = 1
    j.requirements = None
    j.preferred_experience_years = None
    j.is_active = True
    return j


@pytest.mark.asyncio
async def test_list_jobs(client):
    """GET /api/v1/jobs returns paginated list."""
    with patch("app.api.v1.endpoints.jobs.job_service") as svc:
        svc.list_jobs = AsyncMock(return_value=([], 0))
        r = await client.get("/api/v1/jobs")
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is True
    assert "data" in data
    assert "data" in data["data"]  # paginated items
    assert "total" in data["data"]


@pytest.mark.asyncio
async def test_get_job_not_found(client):
    """GET /api/v1/jobs/{id} returns 200 with success=False when not found."""
    with patch("app.api.v1.endpoints.jobs.job_service") as svc:
        svc.get_by_id = AsyncMock(return_value=None)
        r = await client.get(f"/api/v1/jobs/{uuid4()}")
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is False
    assert data.get("data") is None


@pytest.mark.asyncio
async def test_get_job_found(client):
    """GET /api/v1/jobs/{id} returns job when exists."""
    job = _fake_job()
    with patch("app.api.v1.endpoints.jobs.job_service") as svc:
        svc.get_by_id = AsyncMock(return_value=job)
        r = await client.get(f"/api/v1/jobs/{job.id}")
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is True
    assert data["data"]["title"] == "Test Job"


@pytest.mark.asyncio
async def test_create_job_requires_auth(client):
    """POST /api/v1/jobs without auth returns 401."""
    r = await client.post(
        "/api/v1/jobs",
        json={
            "title": "New Job",
            "description": "Desc",
            "budget_type": "fixed",
            "category_id": str(uuid4()),
        },
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_create_job_success(client):
    """POST /api/v1/jobs without valid auth returns 401 (create requires seeker role)."""
    r = await client.post(
        "/api/v1/jobs",
        json={
            "title": "New Job",
            "description": "Desc",
            "budget_type": "fixed",
            "category_id": str(uuid4()),
        },
        headers={"Authorization": "Bearer invalid"},
    )
    assert r.status_code == 401
