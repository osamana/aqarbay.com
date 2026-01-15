from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class EmailAlertBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    query: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    frequency: str = "daily"  # instant, daily, weekly
    notify_featured: bool = True


class EmailAlertCreate(EmailAlertBase):
    pass


class EmailAlertUpdate(BaseModel):
    name: Optional[str] = None
    query: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    frequency: Optional[str] = None
    notify_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class EmailAlertResponse(EmailAlertBase):
    id: UUID
    is_active: bool
    verified: bool
    last_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmailAlertUnsubscribe(BaseModel):
    token: str

