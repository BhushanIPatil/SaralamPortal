from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class JobListResponse(BaseModel):
    id: UUID
    title: str
    budget_type: str
    budget_min: float | None
    budget_max: float | None
    currency: str
    event_date: datetime | None
    status: str
    category_id: UUID
    seeker_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class JobDetailResponse(BaseModel):
    id: UUID
    seeker_id: UUID
    category_id: UUID
    title: str
    description: str | None
    requirements: str | None
    budget_min: float | None
    budget_max: float | None
    budget_type: str
    currency: str
    event_date: datetime | None
    event_duration_hours: float | None
    event_location_id: UUID | None
    status: str
    visibility: str
    preferred_experience_years: str | None
    slots_available: int
    application_deadline: datetime | None
    created_at: datetime
    # seeker_contact when allowed

    class Config:
        from_attributes = True


class JobCreate(BaseModel):
    category_id: UUID
    title: str = Field(..., max_length=500)
    description: str | None = None
    requirements: str | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    budget_type: str = Field(..., pattern="^(fixed|hourly|negotiable)$")
    currency: str = "INR"
    event_date: datetime | None = None
    event_duration_hours: float | None = None
    event_location_id: UUID | None = None
    visibility: str = Field("public", pattern="^(public|subscription_only)$")
    preferred_experience_years: str | None = None
    slots_available: int = 1
    application_deadline: datetime | None = None


class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    requirements: str | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    budget_type: str | None = None
    event_date: datetime | None = None
    event_duration_hours: float | None = None
    event_location_id: UUID | None = None
    visibility: str | None = None
    preferred_experience_years: str | None = None
    slots_available: int | None = None
    application_deadline: datetime | None = None
    status: str | None = None
