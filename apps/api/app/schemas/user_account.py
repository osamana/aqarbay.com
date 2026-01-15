from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserAccountBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None
    locale: str = "en"
    currency: str = "USD"


class UserAccountCreate(UserAccountBase):
    password: str


class UserAccountLogin(BaseModel):
    email: EmailStr
    password: str


class UserAccountUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    locale: Optional[str] = None
    currency: Optional[str] = None


class UserAccountResponse(UserAccountBase):
    id: UUID
    is_active: bool
    is_verified: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserAccountToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserAccountResponse

