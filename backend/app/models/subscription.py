from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SubscriptionPlan(BaseModel):
    __tablename__ = "tbl_subscription_plans"

    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    plan_type = Column(String(20), nullable=False)  # seeker | provider | both
    duration_type = Column(String(20), nullable=False)  # monthly | yearly | lifetime | custom_days
    duration_days = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    features = Column(String(4000), nullable=True)  # JSON
    max_job_postings_per_month = Column(Integer, default=-1, nullable=False)
    max_applications_per_month = Column(Integer, default=-1, nullable=False)
    can_view_contact_info = Column(Boolean, default=False, nullable=False)
    can_see_premium_jobs = Column(Boolean, default=False, nullable=False)
    priority_listing = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    offers = relationship("SubscriptionOffer", back_populates="plan")
    user_subscriptions = relationship("UserSubscription", back_populates="plan")


class SubscriptionOffer(BaseModel):
    __tablename__ = "tbl_subscription_offers"

    plan_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_subscription_plans.id", ondelete="CASCADE"),
        nullable=False,
    )
    offer_name = Column(String(255), nullable=False)
    offer_code = Column(String(50), unique=True, nullable=False, index=True)
    discount_type = Column(String(20), nullable=False)  # percent | flat | free
    discount_value = Column(Float, default=0.0, nullable=False)
    valid_from = Column(Date, nullable=True)
    valid_until = Column(Date, nullable=True)
    max_redemptions = Column(Integer, nullable=True)
    current_redemptions = Column(Integer, default=0, nullable=False)
    created_by = Column(UNIQUEIDENTIFIER(as_uuid=True), nullable=True)

    plan = relationship("SubscriptionPlan", back_populates="offers")
    user_subscriptions = relationship("UserSubscription", back_populates="offer")


class UserSubscription(BaseModel):
    __tablename__ = "tbl_user_subscriptions"

    user_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    plan_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_subscription_plans.id", ondelete="RESTRICT"),
        nullable=False,
    )
    offer_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_subscription_offers.id", ondelete="SET NULL"),
        nullable=True,
    )
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)  # active | expired | cancelled | trial
    razorpay_subscription_id = Column(String(255), nullable=True)
    razorpay_order_id = Column(String(255), nullable=True)
    amount_paid = Column(Float, nullable=True)
    currency = Column(String(3), nullable=True)
    auto_renew = Column(Boolean, default=False, nullable=False)

    plan = relationship("SubscriptionPlan", back_populates="user_subscriptions")
    offer = relationship("SubscriptionOffer", back_populates="user_subscriptions")
    payments = relationship("Payment", back_populates="subscription")


class Payment(BaseModel):
    __tablename__ = "tbl_payments"

    user_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    subscription_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_user_subscriptions.id", ondelete="SET NULL"),
        nullable=True,
    )
    razorpay_order_id = Column(String(255), nullable=True)
    razorpay_payment_id = Column(String(255), nullable=True)
    razorpay_signature = Column(String(500), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(String(20), nullable=False)  # pending | success | failed | refunded
    payment_method = Column(String(50), nullable=True)
    gateway_response = Column(String(4000), nullable=True)  # JSON

    subscription = relationship("UserSubscription", back_populates="payments")
