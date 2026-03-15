"""
Ratings API tests: submit rating, get provider ratings.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from datetime import datetime, timezone


def _fake_rating(**kwargs):
    r = MagicMock()
    r.id = kwargs.get("id", uuid4())
    r.rating = kwargs.get("rating", 5)
    r.comment = kwargs.get("comment", "Great!")
    r.title = kwargs.get("title")
    r.provider_id = kwargs.get("provider_id", uuid4())
    r.seeker_id = kwargs.get("seeker_id", uuid4())
    r.job_id = kwargs.get("job_id")
    r.created_at = kwargs.get("created_at", datetime.now(timezone.utc))
    r.response_text = None
    return r


@pytest.mark.asyncio
async def test_submit_rating_requires_auth(client):
    """POST /api/v1/ratings without auth returns 401."""
    r = await client.post(
        "/api/v1/ratings",
        json={
            "provider_id": str(uuid4()),
            "rating": 5,
            "comment": "Excellent service with at least twenty characters here.",
        },
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_provider_ratings_public(client):
    """GET /api/v1/ratings/provider/{id} returns paginated ratings (mock service)."""
    with patch("app.services.rating_service.rating_service.list_for_provider", new_callable=AsyncMock, return_value=([], 0)):
        r = await client.get(f"/api/v1/ratings/provider/{uuid4()}")
    assert r.status_code == 200
    data = r.json()
    assert data.get("success") is True
    assert "data" in data
