from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.sql import func
from app.models.base import BaseModel


class PlatformSetting(BaseModel):
    __tablename__ = "tbl_platform_settings"

    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    value_type = Column(String(20), nullable=False)  # string | int | bool | json
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    updated_by = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        ForeignKey("tbl_users.id", ondelete="SET NULL"),
        nullable=True,
    )
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class AppMetadata(BaseModel):
    __tablename__ = "tbl_app_metadata"

    stat_key = Column(String(255), unique=True, nullable=False, index=True)
    stat_value = Column(Text, nullable=True)
    last_computed_at = Column(DateTime(timezone=True), nullable=True)
