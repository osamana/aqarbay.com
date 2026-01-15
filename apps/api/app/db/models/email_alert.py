import uuid
from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
from app.db.base import Base


class EmailAlert(Base):
    """Email alert subscriptions for new property listings."""
    __tablename__ = "email_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=True)
    
    # Search criteria
    query = Column(String(500), nullable=True)  # Search query
    filters = Column(JSONB, nullable=True)  # Filter criteria as JSON
    
    # Alert preferences
    frequency = Column(String(20), default="daily", nullable=False)  # instant, daily, weekly
    notify_featured = Column(Boolean, default=True, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    verified = Column(Boolean, default=False, nullable=False)  # Email verification
    verification_token = Column(String(100), nullable=True, unique=True, index=True)
    
    # Metadata
    last_sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Unsubscribe token
    unsubscribe_token = Column(String(100), nullable=True, unique=True, index=True)

