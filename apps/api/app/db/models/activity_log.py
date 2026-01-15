import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
import enum


class ActivityType(str, enum.Enum):
    """Types of activities that can be logged."""
    PROPERTY_CREATED = "property_created"
    PROPERTY_UPDATED = "property_updated"
    PROPERTY_DELETED = "property_deleted"
    PROPERTY_PUBLISHED = "property_published"
    PROPERTY_UNPUBLISHED = "property_unpublished"
    LOCATION_CREATED = "location_created"
    LOCATION_UPDATED = "location_updated"
    LOCATION_DELETED = "location_deleted"
    AGENT_CREATED = "agent_created"
    AGENT_UPDATED = "agent_updated"
    AGENT_DELETED = "agent_deleted"
    LEAD_CREATED = "lead_created"
    LEAD_UPDATED = "lead_updated"
    SETTINGS_UPDATED = "settings_updated"
    USER_LOGIN = "user_login"
    BULK_OPERATION = "bulk_operation"


class ActivityLog(Base):
    """Audit trail for all admin actions."""
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    activity_type = Column(Enum(ActivityType), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    user_email = Column(String(255), nullable=True)  # Store email in case user is deleted
    resource_type = Column(String(50), nullable=True, index=True)  # e.g., "property", "location"
    resource_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    description = Column(Text, nullable=False)
    changes = Column(JSONB, nullable=True)  # Store before/after changes
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", lazy="select")

