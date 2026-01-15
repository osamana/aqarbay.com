from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.crud.base import CRUDBase
from app.db.models.email_alert import EmailAlert
from app.schemas.email_alert import EmailAlertCreate, EmailAlertUpdate
import secrets


class CRUDEmailAlert(CRUDBase[EmailAlert, EmailAlertCreate, EmailAlertUpdate]):
    def create_with_token(self, db: Session, *, obj_in: EmailAlertCreate) -> EmailAlert:
        """Create email alert with verification and unsubscribe tokens."""
        verification_token = secrets.token_urlsafe(32)
        unsubscribe_token = secrets.token_urlsafe(32)
        
        db_obj = EmailAlert(
            **obj_in.dict(),
            verification_token=verification_token,
            unsubscribe_token=unsubscribe_token,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_by_email(self, db: Session, *, email: str) -> Optional[EmailAlert]:
        """Get email alert by email address."""
        return db.query(EmailAlert).filter(EmailAlert.email == email).first()
    
    def get_by_verification_token(self, db: Session, *, token: str) -> Optional[EmailAlert]:
        """Get email alert by verification token."""
        return db.query(EmailAlert).filter(EmailAlert.verification_token == token).first()
    
    def get_by_unsubscribe_token(self, db: Session, *, token: str) -> Optional[EmailAlert]:
        """Get email alert by unsubscribe token."""
        return db.query(EmailAlert).filter(EmailAlert.unsubscribe_token == token).first()
    
    def get_active_alerts(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[EmailAlert]:
        """Get all active email alerts."""
        return db.query(EmailAlert).filter(
            and_(EmailAlert.is_active == True, EmailAlert.verified == True)
        ).offset(skip).limit(limit).all()
    
    def verify(self, db: Session, *, alert: EmailAlert) -> EmailAlert:
        """Verify an email alert."""
        alert.verified = True
        alert.verification_token = None
        db.commit()
        db.refresh(alert)
        return alert
    
    def unsubscribe(self, db: Session, *, alert: EmailAlert) -> EmailAlert:
        """Unsubscribe an email alert."""
        alert.is_active = False
        db.commit()
        db.refresh(alert)
        return alert


crud_email_alert = CRUDEmailAlert(EmailAlert)

