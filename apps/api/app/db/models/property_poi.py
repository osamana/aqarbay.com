import uuid
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class PropertyPOI(Base):
    __tablename__ = "property_pois"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # POI details
    category = Column(String(50), nullable=False, index=True)  # schools, mosques, hospitals, etc.
    name = Column(String(500), nullable=False)
    name_en = Column(String(500), nullable=True)
    name_ar = Column(String(500), nullable=True)
    lat = Column(Numeric(10, 8), nullable=False)
    lng = Column(Numeric(11, 8), nullable=False)
    distance = Column(Numeric(10, 1), nullable=False)  # Distance in meters
    poi_type = Column(String(100), nullable=True)  # OSM type (amenity, shop, etc.)
    address = Column(String(500), nullable=True)
    
    # Sort order within category (closest first)
    sort_order = Column(Integer, nullable=False, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    property = relationship("Property", back_populates="pois")

