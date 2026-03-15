import uuid
from sqlalchemy import Boolean, Column, DateTime, text
from sqlalchemy.sql import func
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from app.core.database import Base


class BaseModel(Base):
    __abstract__ = True

    id = Column(
        UNIQUEIDENTIFIER(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("NEWID()"),
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UNIQUEIDENTIFIER(as_uuid=True), nullable=True)
    updated_by = Column(UNIQUEIDENTIFIER(as_uuid=True), nullable=True)
