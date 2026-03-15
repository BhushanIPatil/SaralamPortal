from sqlalchemy import Boolean, Column, Float, ForeignKey, String, Text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Rating(BaseModel):
    __tablename__ = "tbl_ratings"

    job_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_jobs.id", ondelete="SET NULL"),
        nullable=True,
    )
    application_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_job_applications.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewer_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    reviewee_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    rating = Column(Float, nullable=False)  # 1-5
    title = Column(String(255), nullable=True)
    review_text = Column(Text, nullable=True)
    tags = Column(String(4000), nullable=True)  # JSON
    is_verified_transaction = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=True, nullable=False)

    responses = relationship("RatingResponse", back_populates="rating")


class RatingResponse(BaseModel):
    __tablename__ = "tbl_rating_responses"

    rating_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_ratings.id", ondelete="CASCADE"),
        nullable=False,
    )
    responder_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    response_text = Column(Text, nullable=False)

    rating = relationship("Rating", back_populates="responses")
