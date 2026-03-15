from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.sql import func
from app.models.base import BaseModel


class JobApplication(BaseModel):
    __tablename__ = "tbl_job_applications"

    job_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_jobs.id", ondelete="CASCADE"),
        nullable=False,
    )
    applicant_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    service_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_services.id", ondelete="SET NULL"),
        nullable=True,
    )
    cover_letter = Column(Text, nullable=True)
    proposed_price = Column(Float, nullable=True)
    proposed_timeline = Column(String(255), nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    is_read_by_seeker = Column(Boolean, default=False, nullable=False)
    applied_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class Shortlist(BaseModel):
    __tablename__ = "tbl_shortlist"

    seeker_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    service_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_services.id", ondelete="SET NULL"),
        nullable=True,
    )
    notes = Column(Text, nullable=True)
