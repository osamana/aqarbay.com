import uuid
from sqlalchemy import Column, String, DateTime, Numeric, Integer, Boolean, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
import enum


class PropertyPurpose(str, enum.Enum):
    sell = "sell"
    rent = "rent"


class PropertyType(str, enum.Enum):
    apartment = "apartment"
    house = "house"
    villa = "villa"
    land = "land"
    commercial = "commercial"
    office = "office"
    store = "store"


class PropertyStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    sold = "sold"
    rented = "rented"


class PropertyCurrency(str, enum.Enum):
    ILS = "ILS"
    USD = "USD"
    JOD = "JOD"


class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title_en = Column(String(500), nullable=False)
    title_ar = Column(String(500), nullable=False)
    slug_en = Column(String(500), unique=True, nullable=False, index=True)
    slug_ar = Column(String(500), unique=True, nullable=False, index=True)
    description_en = Column(Text, nullable=True)
    description_ar = Column(Text, nullable=True)
    
    purpose = Column(Enum(PropertyPurpose), nullable=False, index=True)
    type = Column(Enum(PropertyType), nullable=False, index=True)
    status = Column(Enum(PropertyStatus), nullable=False, default=PropertyStatus.available, index=True)
    
    price_amount = Column(Numeric(15, 2), nullable=False, index=True)
    price_currency = Column(Enum(PropertyCurrency), nullable=False, default=PropertyCurrency.ILS)
    
    area_m2 = Column(Numeric(10, 2), nullable=True)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    furnished = Column(Boolean, default=False, nullable=False)
    parking = Column(Boolean, default=False, nullable=False)
    floor = Column(Integer, nullable=True)
    year_built = Column(Integer, nullable=True)
    
    video_url = Column(String(500), nullable=True)
    lat = Column(Numeric(10, 8), nullable=True)
    lng = Column(Numeric(11, 8), nullable=True)
    show_exact_location = Column(Boolean, default=False, nullable=False)
    
    featured = Column(Boolean, default=False, nullable=False, index=True)
    published = Column(Boolean, default=False, nullable=False, index=True)
    
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"), nullable=True, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    location = relationship("Location", back_populates="properties", lazy="joined")
    agent = relationship("Agent", back_populates="properties", lazy="joined")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan", lazy="joined", order_by="PropertyImage.sort_order")
    leads = relationship("Lead", back_populates="property", lazy="select")
    pois = relationship("PropertyPOI", back_populates="property", cascade="all, delete-orphan", lazy="select", order_by="PropertyPOI.category, PropertyPOI.sort_order")

