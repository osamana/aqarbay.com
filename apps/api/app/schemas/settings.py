from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional


class SettingsBase(BaseModel):
    site_name_en: str = "Palestine Real Estate"
    site_name_ar: str = "عقارات فلسطين"
    primary_color: str = "#f5c325"
    logo_key: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_whatsapp: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    meta_title_en: Optional[str] = None
    meta_title_ar: Optional[str] = None
    meta_desc_en: Optional[str] = None
    meta_desc_ar: Optional[str] = None


class SettingsUpdate(SettingsBase):
    pass


class SettingsInDB(SettingsBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Settings(SettingsInDB):
    pass

