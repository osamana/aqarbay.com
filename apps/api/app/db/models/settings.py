import uuid
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.db.base import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_name_en = Column(String(255), nullable=False, default="Palestine Real Estate")
    site_name_ar = Column(String(255), nullable=False, default="عقارات فلسطين")
    primary_color = Column(String(7), nullable=False, default="#f5c325")
    logo_key = Column(String(500), nullable=True)  # MinIO file key
    contact_phone = Column(String(50), nullable=True)
    contact_whatsapp = Column(String(50), nullable=True)
    facebook_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    meta_title_en = Column(String(255), nullable=True)
    meta_title_ar = Column(String(255), nullable=True)
    meta_desc_en = Column(Text, nullable=True)
    meta_desc_ar = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

