from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime
from typing import Optional


class LeadBase(BaseModel):
    property_id: Optional[UUID4] = None
    name: str
    phone: str
    email: Optional[EmailStr] = None
    message: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    status: Optional[str] = None


class LeadInDB(LeadBase):
    id: UUID4
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class Lead(LeadInDB):
    pass

