from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.db.models.user_account import UserAccount
from app.schemas.user_account import UserAccountCreate, UserAccountUpdate
from passlib.context import CryptContext
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CRUDUserAccount(CRUDBase[UserAccount, UserAccountCreate, UserAccountUpdate]):
    def create(self, db: Session, *, obj_in: UserAccountCreate) -> UserAccount:
        """Create a new user account with hashed password."""
        verification_token = secrets.token_urlsafe(32)
        
        db_obj = UserAccount(
            email=obj_in.email,
            name=obj_in.name,
            phone=obj_in.phone,
            locale=obj_in.locale,
            currency=obj_in.currency,
            password_hash=pwd_context.hash(obj_in.password),
            verification_token=verification_token,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_email(self, db: Session, *, email: str) -> Optional[UserAccount]:
        """Get user account by email."""
        return db.query(UserAccount).filter(UserAccount.email == email).first()
    
    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[UserAccount]:
        """Authenticate user by email and password."""
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not pwd_context.verify(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return user
    
    def verify(self, db: Session, *, user: UserAccount) -> UserAccount:
        """Verify user email."""
        user.is_verified = True
        user.verification_token = None
        db.commit()
        db.refresh(user)
        return user
    
    def update_password(self, db: Session, *, user: UserAccount, new_password: str) -> UserAccount:
        """Update user password."""
        user.password_hash = pwd_context.hash(new_password)
        db.commit()
        db.refresh(user)
        return user


crud_user_account = CRUDUserAccount(UserAccount)

