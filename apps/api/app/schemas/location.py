from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional


class LocationBase(BaseModel):
    name_en: str
    name_ar: str
    slug_en: str
    slug_ar: str
    parent_id: Optional[UUID4] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    slug_en: Optional[str] = None
    slug_ar: Optional[str] = None
    parent_id: Optional[UUID4] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class LocationInDB(LocationBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Location(LocationInDB):
    pass

