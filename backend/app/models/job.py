from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import BaseModel


class Job(BaseModel):
    __tablename__ = "tbl_jobs"

    seeker_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_service_categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    budget_type = Column(String(20), nullable=False)  # fixed | hourly | negotiable
    currency = Column(String(3), default="INR", nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=True)
    event_duration_hours = Column(Float, nullable=True)
    event_location_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_addresses.id", ondelete="SET NULL"),
        nullable=True,
    )
    status = Column(String(30), nullable=False, default="draft")
    visibility = Column(String(20), default="public", nullable=False)
    preferred_experience_years = Column(String(50), nullable=True)
    slots_available = Column(Integer, default=1, nullable=False)
    application_deadline = Column(DateTime(timezone=True), nullable=True)

    media = relationship("JobMedia", back_populates="job", order_by="JobMedia.sort_order")


class JobMedia(BaseModel):
    __tablename__ = "tbl_job_media"

    job_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_jobs.id", ondelete="CASCADE"),
        nullable=False,
    )
    media_type = Column(String(20), nullable=False)  # image | video | document
    url = Column(String(1000), nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    job = relationship("Job", back_populates="media")
