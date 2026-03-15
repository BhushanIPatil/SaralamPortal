from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class RatingCreate(BaseModel):
    job_id: UUID | None = None
    application_id: UUID | None = None
    reviewee_id: UUID
    rating: float = Field(..., ge=1, le=5)
    title: str | None = None
    review_text: str | None = None
    tags: str | None = None


class RatingResponse(BaseModel):
    id: UUID
    job_id: UUID | None
    application_id: UUID | None
    reviewer_id: UUID
    reviewee_id: UUID
    rating: float
    title: str | None
    review_text: str | None
    is_verified_transaction: bool
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RatingRespondRequest(BaseModel):
    response_text: str = Field(..., min_length=1)
