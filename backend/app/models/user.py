from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "tbl_users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    role = Column(String(20), nullable=False, default="seeker")  # seeker | provider | admin
    is_email_verified = Column(Boolean, default=False, nullable=False)
    is_phone_verified = Column(Boolean, default=False, nullable=False)
    is_suspended = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    full_name = Column(String(255), nullable=False)

    profiles = relationship("UserProfile", back_populates="user", uselist=False)
    addresses = relationship("Address", back_populates="user")


class UserProfile(BaseModel):
    __tablename__ = "tbl_user_profiles"

    user_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    bio = Column(Text, nullable=True)
    experience_years = Column(String(50), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    social_links = Column(String(4000), nullable=True)  # JSON
    languages = Column(String(500), nullable=True)
    availability_status = Column(String(50), nullable=True)

    user = relationship("User", back_populates="profiles")


class Address(BaseModel):
    __tablename__ = "tbl_addresses"

    user_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    address_type = Column(String(20), nullable=False)  # home | work | other
    address_line1 = Column(String(500), nullable=False)
    address_line2 = Column(String(500), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=True)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="addresses")

    __table_args__ = (Index("ix_tbl_addresses_user_id", "user_id"),)
