from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: UUID
    type: str
    title: str
    message: str | None
    is_read: bool
    read_at: datetime | None
    action_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationPreferencesResponse(BaseModel):
    email_enabled: bool
    push_enabled: bool
    job_alerts: bool
    application_updates: bool
    rating_alerts: bool
    subscription_alerts: bool
    marketing_alerts: bool
    preferred_categories: str | None

    class Config:
        from_attributes = True


class NotificationPreferencesUpdate(BaseModel):
    email_enabled: bool | None = None
    push_enabled: bool | None = None
    job_alerts: bool | None = None
    application_updates: bool | None = None
    rating_alerts: bool | None = None
    subscription_alerts: bool | None = None
    marketing_alerts: bool | None = None
    preferred_categories: str | None = None
