"""001_initial_schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2025-01-01

Creates all tbl_* tables for Saralam (MS SQL Server).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # tbl_users
    op.create_table(
        "tbl_users",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=True),
        sa.Column("google_id", sa.String(255), nullable=True),
        sa.Column("role", sa.String(20), nullable=False, server_default="seeker"),
        sa.Column("is_email_verified", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("is_phone_verified", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("is_suspended", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("profile_picture_url", sa.String(500), nullable=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tbl_users_email", "tbl_users", ["email"], unique=True)
    op.create_index("ix_tbl_users_phone", "tbl_users", ["phone"], unique=True)
    op.create_index("ix_tbl_users_google_id", "tbl_users", ["google_id"], unique=True)

    # tbl_user_profiles
    op.create_table(
        "tbl_user_profiles",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("user_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("experience_years", sa.String(50), nullable=True),
        sa.Column("portfolio_url", sa.String(500), nullable=True),
        sa.Column("website_url", sa.String(500), nullable=True),
        sa.Column("social_links", sa.String(4000), nullable=True),
        sa.Column("languages", sa.String(500), nullable=True),
        sa.Column("availability_status", sa.String(50), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["tbl_users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tbl_user_profiles_user_id", "tbl_user_profiles", ["user_id"], unique=False)

    # tbl_addresses
    op.create_table(
        "tbl_addresses",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("user_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("address_type", sa.String(20), nullable=False),
        sa.Column("address_line1", sa.String(500), nullable=False),
        sa.Column("address_line2", sa.String(500), nullable=True),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("country", sa.String(100), nullable=False),
        sa.Column("pincode", sa.String(20), nullable=True),
        sa.Column("latitude", sa.String(50), nullable=True),
        sa.Column("longitude", sa.String(50), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["user_id"], ["tbl_users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tbl_addresses_user_id", "tbl_addresses", ["user_id"], unique=False)

    # tbl_service_categories
    op.create_table(
        "tbl_service_categories",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("icon_url", sa.String(500), nullable=True),
        sa.Column("parent_category_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["parent_category_id"], ["tbl_service_categories.id"], ondelete="NO ACTION"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tbl_service_categories_slug", "tbl_service_categories", ["slug"], unique=True)

    # tbl_services
    op.create_table(
        "tbl_services",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("provider_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("category_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price_type", sa.String(20), nullable=False),
        sa.Column("base_price", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("location_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("service_radius_km", sa.Float(), nullable=True),
        sa.Column("portfolio_images", sa.String(4000), nullable=True),
        sa.Column("tags", sa.String(4000), nullable=True),
        sa.Column("avg_rating", sa.Float(), nullable=False, server_default="0"),
        sa.Column("total_reviews", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_jobs_completed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("subscription_required", sa.Boolean(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["category_id"], ["tbl_service_categories.id"], ondelete="NO ACTION"),
        sa.ForeignKeyConstraint(["location_id"], ["tbl_addresses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["provider_id"], ["tbl_users.id"], ondelete="NO ACTION"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_jobs
    op.create_table(
        "tbl_jobs",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("seeker_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("category_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("budget_min", sa.Float(), nullable=True),
        sa.Column("budget_max", sa.Float(), nullable=True),
        sa.Column("budget_type", sa.String(20), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("event_duration_hours", sa.Float(), nullable=True),
        sa.Column("event_location_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="draft"),
        sa.Column("visibility", sa.String(20), nullable=False, server_default="public"),
        sa.Column("preferred_experience_years", sa.String(50), nullable=True),
        sa.Column("slots_available", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("application_deadline", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["category_id"], ["tbl_service_categories.id"], ondelete="NO ACTION"),
        sa.ForeignKeyConstraint(["event_location_id"], ["tbl_addresses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["seeker_id"], ["tbl_users.id"], ondelete="NO ACTION"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_job_media
    op.create_table(
        "tbl_job_media",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("job_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("media_type", sa.String(20), nullable=False),
        sa.Column("url", sa.String(1000), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["job_id"], ["tbl_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_job_applications
    op.create_table(
        "tbl_job_applications",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("job_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("applicant_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("service_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("proposed_price", sa.Float(), nullable=True),
        sa.Column("proposed_timeline", sa.String(255), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("is_read_by_seeker", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("applied_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["applicant_id"], ["tbl_users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["job_id"], ["tbl_jobs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["tbl_services.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_shortlist
    op.create_table(
        "tbl_shortlist",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("seeker_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("provider_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("service_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["provider_id"], ["tbl_users.id"], ondelete="NO ACTION"),
        sa.ForeignKeyConstraint(["seeker_id"], ["tbl_users.id"], ondelete="NO ACTION"),
        sa.ForeignKeyConstraint(["service_id"], ["tbl_services.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_subscription_plans
    op.create_table(
        "tbl_subscription_plans",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("plan_type", sa.String(20), nullable=False),
        sa.Column("duration_type", sa.String(20), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("features", sa.String(4000), nullable=True),
        sa.Column("max_job_postings_per_month", sa.Integer(), nullable=False, server_default="-1"),
        sa.Column("max_applications_per_month", sa.Integer(), nullable=False, server_default="-1"),
        sa.Column("can_view_contact_info", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("can_see_premium_jobs", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("priority_listing", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tbl_subscription_plans_slug", "tbl_subscription_plans", ["slug"], unique=True)

    # tbl_subscription_offers
    op.create_table(
        "tbl_subscription_offers",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("plan_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("offer_name", sa.String(255), nullable=False),
        sa.Column("offer_code", sa.String(50), nullable=False),
        sa.Column("discount_type", sa.String(20), nullable=False),
        sa.Column("discount_value", sa.Float(), nullable=False, server_default="0"),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_until", sa.Date(), nullable=True),
        sa.Column("max_redemptions", sa.Integer(), nullable=True),
        sa.Column("current_redemptions", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["plan_id"], ["tbl_subscription_plans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tbl_subscription_offers_offer_code", "tbl_subscription_offers", ["offer_code"], unique=True)

    # tbl_user_subscriptions
    op.create_table(
        "tbl_user_subscriptions",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("user_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("plan_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("offer_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("razorpay_subscription_id", sa.String(255), nullable=True),
        sa.Column("razorpay_order_id", sa.String(255), nullable=True),
        sa.Column("amount_paid", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(3), nullable=True),
        sa.Column("auto_renew", sa.Boolean(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["offer_id"], ["tbl_subscription_offers.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["plan_id"], ["tbl_subscription_plans.id"], ondelete="NO ACTION"),
        sa.ForeignKeyConstraint(["user_id"], ["tbl_users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_payments
    op.create_table(
        "tbl_payments",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("user_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("subscription_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("razorpay_order_id", sa.String(255), nullable=True),
        sa.Column("razorpay_payment_id", sa.String(255), nullable=True),
        sa.Column("razorpay_signature", sa.String(500), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("payment_method", sa.String(50), nullable=True),
        sa.Column("gateway_response", sa.String(4000), nullable=True),
        sa.ForeignKeyConstraint(["subscription_id"], ["tbl_user_subscriptions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["tbl_users.id"], ondelete="NO ACTION"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_ratings
    op.create_table(
        "tbl_ratings",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("job_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("application_id", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("reviewer_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("reviewee_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("review_text", sa.Text(), nullable=True),
        sa.Column("tags", sa.String(4000), nullable=True),
        sa.Column("is_verified_transaction", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default="1"),
        sa.ForeignKeyConstraint(["application_id"], ["tbl_job_applications.id"], ondelete="NO ACTION"),
        sa.ForeignKeyConstraint(["job_id"], ["tbl_jobs.id"], ondelete="NO ACTION"),
        sa.ForeignKeyConstraint(["reviewee_id"], ["tbl_users.id"], ondelete="NO ACTION"),
        sa.ForeignKeyConstraint(["reviewer_id"], ["tbl_users.id"], ondelete="NO ACTION"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_rating_responses
    op.create_table(
        "tbl_rating_responses",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("rating_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("responder_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("response_text", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["rating_id"], ["tbl_ratings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["responder_id"], ["tbl_users.id"], ondelete="NO ACTION"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_notifications
    op.create_table(
        "tbl_notifications",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("user_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("payload", sa.String(4000), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("action_url", sa.String(1000), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["tbl_users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_notification_preferences
    op.create_table(
        "tbl_notification_preferences",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("user_id", UNIQUEIDENTIFIER(), nullable=False),
        sa.Column("email_enabled", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("push_enabled", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("job_alerts", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("application_updates", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("rating_alerts", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("subscription_alerts", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("marketing_alerts", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("preferred_categories", sa.String(4000), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["tbl_users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # tbl_platform_settings
    op.create_table(
        "tbl_platform_settings",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("key", sa.String(255), nullable=False),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column("value_type", sa.String(20), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["updated_by"], ["tbl_users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tbl_platform_settings_key", "tbl_platform_settings", ["key"], unique=True)

    # tbl_app_metadata
    op.create_table(
        "tbl_app_metadata",
        sa.Column("id", UNIQUEIDENTIFIER(), server_default=sa.text("NEWID()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("updated_by", UNIQUEIDENTIFIER(), nullable=True),
        sa.Column("stat_key", sa.String(255), nullable=False),
        sa.Column("stat_value", sa.Text(), nullable=True),
        sa.Column("last_computed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tbl_app_metadata_stat_key", "tbl_app_metadata", ["stat_key"], unique=True)


def downgrade() -> None:
    op.drop_table("tbl_app_metadata")
    op.drop_table("tbl_platform_settings")
    op.drop_table("tbl_notification_preferences")
    op.drop_table("tbl_notifications")
    op.drop_table("tbl_rating_responses")
    op.drop_table("tbl_ratings")
    op.drop_table("tbl_payments")
    op.drop_table("tbl_user_subscriptions")
    op.drop_table("tbl_subscription_offers")
    op.drop_table("tbl_subscription_plans")
    op.drop_table("tbl_shortlist")
    op.drop_table("tbl_job_applications")
    op.drop_table("tbl_job_media")
    op.drop_table("tbl_jobs")
    op.drop_table("tbl_services")
    op.drop_table("tbl_service_categories")
    op.drop_table("tbl_addresses")
    op.drop_table("tbl_user_profiles")
    op.drop_table("tbl_users")
