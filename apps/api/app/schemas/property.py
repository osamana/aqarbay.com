from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class PropertyImageBase(BaseModel):
    file_key: str
    alt_en: Optional[str] = None
    alt_ar: Optional[str] = None
    sort_order: int = 0


class PropertyImageCreate(PropertyImageBase):
    pass


class PropertyImageInDB(PropertyImageBase):
    id: UUID4
    property_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PropertyImage(PropertyImageInDB):
    pass


class PropertyBase(BaseModel):
    title_en: str
    title_ar: str
    slug_en: str
    slug_ar: str
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    purpose: str  # sell | rent
    type: str  # apartment | house | villa | land | commercial | office | store
    status: str = "available"
    price_amount: Decimal
    price_currency: str = "ILS"
    area_m2: Optional[Decimal] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    furnished: bool = False
    parking: bool = False
    floor: Optional[int] = None
    year_built: Optional[int] = None
    video_url: Optional[str] = None
    lat: Optional[Decimal] = None
    lng: Optional[Decimal] = None
    show_exact_location: bool = False
    featured: bool = False
    published: bool = False
    location_id: UUID4
    agent_id: Optional[UUID4] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title_en: Optional[str] = None
    title_ar: Optional[str] = None
    slug_en: Optional[str] = None
    slug_ar: Optional[str] = None
    description_en: Optional[str] = None
    description_ar: Optional[str] = None
    purpose: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    price_amount: Optional[Decimal] = None
    price_currency: Optional[str] = None
    area_m2: Optional[Decimal] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    furnished: Optional[bool] = None
    parking: Optional[bool] = None
    floor: Optional[int] = None
    year_built: Optional[int] = None
    video_url: Optional[str] = None
    lat: Optional[Decimal] = None
    lng: Optional[Decimal] = None
    show_exact_location: Optional[bool] = None
    featured: Optional[bool] = None
    published: Optional[bool] = None
    location_id: Optional[UUID4] = None
    agent_id: Optional[UUID4] = None


class PropertyInDB(PropertyBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Property(PropertyInDB):
    images: List[PropertyImage] = []
    location: Optional[dict] = None
    agent: Optional[dict] = None


class PropertyList(PropertyInDB):
    """Simplified property for list views"""
    first_image: Optional[str] = None
    location_name: Optional[str] = None

