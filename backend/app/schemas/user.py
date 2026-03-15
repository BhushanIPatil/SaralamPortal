from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str | None = None
    profile_picture_url: str | None = None


class UserMeResponse(BaseModel):
    id: UUID
    email: str
    phone: str | None
    full_name: str
    role: str
    profile_picture_url: str | None
    is_email_verified: bool
    is_phone_verified: bool
    last_login_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class UserMeUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    phone: str | None = None


class UserProfileResponse(BaseModel):
    bio: str | None
    experience_years: str | None
    portfolio_url: str | None
    website_url: str | None
    languages: str | None
    availability_status: str | None

    class Config:
        from_attributes = True


class AddressBase(BaseModel):
    address_type: str = Field(..., pattern="^(home|work|other)$")
    address_line1: str = Field(..., max_length=500)
    address_line2: str | None = None
    city: str = Field(..., max_length=100)
    state: str | None = None
    country: str = Field(..., max_length=100)
    pincode: str | None = None
    latitude: str | None = None
    longitude: str | None = None
    is_primary: bool = False


class AddressResponse(BaseModel):
    id: UUID
    address_type: str
    address_line1: str
    address_line2: str | None
    city: str
    state: str | None
    country: str
    pincode: str | None
    is_primary: bool
    is_active: bool

    class Config:
        from_attributes = True


class UserPublicResponse(BaseModel):
    id: UUID
    full_name: str
    profile_picture_url: str | None
    role: str
    profile: UserProfileResponse | None = None
    # contact (email/phone) only when allowed by subscription

    class Config:
        from_attributes = True


class ProviderSearchResponse(BaseModel):
    id: UUID
    full_name: str
    profile_picture_url: str | None

    class Config:
        from_attributes = True
