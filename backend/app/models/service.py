from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ServiceCategory(BaseModel):
    __tablename__ = "tbl_service_categories"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon_url = Column(String(500), nullable=True)
    parent_category_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_service_categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    sort_order = Column(Integer, default=0, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    parent = relationship("ServiceCategory", remote_side="ServiceCategory.id", back_populates="children")
    children = relationship("ServiceCategory", back_populates="parent")
    services = relationship("Service", back_populates="category")


class Service(BaseModel):
    __tablename__ = "tbl_services"

    provider_id = Column(
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
    price_type = Column(String(20), nullable=False)  # fixed | hourly | negotiable
    base_price = Column(Float, nullable=True)
    currency = Column(String(3), default="INR", nullable=False)
    location_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_addresses.id", ondelete="SET NULL"),
        nullable=True,
    )
    service_radius_km = Column(Float, nullable=True)
    portfolio_images = Column(String(4000), nullable=True)  # JSON array of urls
    tags = Column(String(4000), nullable=True)  # JSON
    avg_rating = Column(Float, default=0.0, nullable=False)
    total_reviews = Column(Integer, default=0, nullable=False)
    total_jobs_completed = Column(Integer, default=0, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    subscription_required = Column(Boolean, default=False, nullable=False)

    category = relationship("ServiceCategory", back_populates="services")
