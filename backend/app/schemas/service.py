from uuid import UUID
from pydantic import BaseModel, Field


class ServiceCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str | None
    icon_url: str | None
    parent_category_id: UUID | None
    sort_order: int
    is_featured: bool
    children: list["ServiceCategoryResponse"] = []

    class Config:
        from_attributes = True


ServiceCategoryResponse.model_rebuild()


class ServiceListResponse(BaseModel):
    id: UUID
    title: str
    price_type: str
    base_price: float | None
    currency: str
    avg_rating: float
    total_reviews: int
    is_verified: bool
    is_featured: bool
    category_id: UUID
    provider_id: UUID
    # provider_name, city can be added from joins

    class Config:
        from_attributes = True


class ServiceDetailResponse(BaseModel):
    id: UUID
    provider_id: UUID
    category_id: UUID
    title: str
    description: str | None
    price_type: str
    base_price: float | None
    currency: str
    service_radius_km: float | None
    portfolio_images: str | None  # JSON string
    tags: str | None
    avg_rating: float
    total_reviews: int
    total_jobs_completed: int
    is_verified: bool
    is_featured: bool
    subscription_required: bool
    # provider_contact (email/phone) when allowed

    class Config:
        from_attributes = True


class ServiceCreate(BaseModel):
    category_id: UUID
    title: str = Field(..., max_length=500)
    description: str | None = None
    price_type: str = Field(..., pattern="^(fixed|hourly|negotiable)$")
    base_price: float | None = None
    currency: str = "INR"
    location_id: UUID | None = None
    service_radius_km: float | None = None
    portfolio_images: str | None = None  # JSON array URLs
    tags: str | None = None
    subscription_required: bool = False


class ServiceUpdate(BaseModel):
    title: str | None = Field(None, max_length=500)
    description: str | None = None
    price_type: str | None = None
    base_price: float | None = None
    location_id: UUID | None = None
    service_radius_km: float | None = None
    portfolio_images: str | None = None
    tags: str | None = None
    subscription_required: bool | None = None
