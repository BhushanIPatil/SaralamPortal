from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from app.models.base import BaseModel


class Notification(BaseModel):
    __tablename__ = "tbl_notifications"

    user_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    type = Column(String(50), nullable=False)
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=True)
    payload = Column(String(4000), nullable=True)  # JSON
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    action_url = Column(String(1000), nullable=True)


class NotificationPreference(BaseModel):
    __tablename__ = "tbl_notification_preferences"

    user_id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="CASCADE"),
        nullable=False,
    )
    email_enabled = Column(Boolean, default=True, nullable=False)
    push_enabled = Column(Boolean, default=True, nullable=False)
    job_alerts = Column(Boolean, default=True, nullable=False)
    application_updates = Column(Boolean, default=True, nullable=False)
    rating_alerts = Column(Boolean, default=True, nullable=False)
    subscription_alerts = Column(Boolean, default=True, nullable=False)
    marketing_alerts = Column(Boolean, default=False, nullable=False)
    preferred_categories = Column(String(4000), nullable=True)  # JSON array of category_ids
