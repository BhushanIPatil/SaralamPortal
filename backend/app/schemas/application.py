from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    applicant_id: UUID
    service_id: UUID | None
    cover_letter: str | None
    proposed_price: float | None
    proposed_timeline: str | None
    status: str
    is_read_by_seeker: bool
    applied_at: datetime

    class Config:
        from_attributes = True


class ApplyRequest(BaseModel):
    service_id: UUID | None = None
    cover_letter: str | None = None
    proposed_price: float | None = None
    proposed_timeline: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(shortlisted|rejected|accepted)$")
