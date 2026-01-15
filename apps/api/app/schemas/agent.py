from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime
from typing import Optional


class AgentBase(BaseModel):
    name: str
    phone: str
    whatsapp: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_key: Optional[str] = None
    bio_en: Optional[str] = None
    bio_ar: Optional[str] = None


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_key: Optional[str] = None
    bio_en: Optional[str] = None
    bio_ar: Optional[str] = None


class AgentInDB(AgentBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Agent(AgentInDB):
    pass

