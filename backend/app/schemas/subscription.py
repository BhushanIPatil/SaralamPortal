from datetime import date
from uuid import UUID
from pydantic import BaseModel, Field


class PlanResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    plan_type: str
    duration_type: str
    duration_days: int
    price: float
    currency: str
    features: str | None
    max_job_postings_per_month: int
    max_applications_per_month: int
    can_view_contact_info: bool
    can_see_premium_jobs: bool
    priority_listing: bool
    sort_order: int

    class Config:
        from_attributes = True


class OfferResponse(BaseModel):
    id: UUID
    offer_name: str
    offer_code: str
    discount_type: str
    discount_value: float
    valid_until: date | None

    class Config:
        from_attributes = True


class PlanWithOffersResponse(PlanResponse):
    offers: list[OfferResponse] = []


class SubscribeRequest(BaseModel):
    plan_id: UUID
    offer_code: str | None = None


class SubscribeResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    razorpay_order_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class MySubscriptionResponse(BaseModel):
    plan_name: str
    status: str
    start_date: date
    end_date: date
    auto_renew: bool
    amount_paid: float | None
    currency: str | None
