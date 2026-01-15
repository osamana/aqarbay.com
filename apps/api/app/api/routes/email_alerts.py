"""
Email alert subscription endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.deps import get_db
from app.crud.crud_email_alert import crud_email_alert
from app.schemas.email_alert import (
    EmailAlertCreate,
    EmailAlertUpdate,
    EmailAlertResponse,
    EmailAlertUnsubscribe,
)
from app.api.routes.user_accounts import get_current_user, UserAccountResponse, oauth2_scheme

router = APIRouter()


@router.post("/subscribe", response_model=EmailAlertResponse, status_code=status.HTTP_201_CREATED)
def subscribe(
    alert_in: EmailAlertCreate,
    db: Session = Depends(get_db),
):
    """
    Subscribe to email alerts for new listings.
    """
    # Check if email already has an active subscription
    existing = crud_email_alert.get_by_email(db, email=alert_in.email)
    if existing and existing.is_active:
        # Update existing subscription
        updated = crud_email_alert.update(db, db_obj=existing, obj_in=alert_in)
        return EmailAlertResponse.from_orm(updated)
    
    # Create new subscription
    alert = crud_email_alert.create_with_token(db, obj_in=alert_in)
    
    # TODO: Send verification email
    # For now, auto-verify (in production, send email with verification_token)
    alert = crud_email_alert.verify(db, alert=alert)
    
    return EmailAlertResponse.from_orm(alert)


@router.get("/verify/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify email alert subscription."""
    alert = crud_email_alert.get_by_verification_token(db, token=token)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid verification token",
        )
    
    alert = crud_email_alert.verify(db, alert=alert)
    return {"message": "Email verified successfully", "email": alert.email}


@router.post("/unsubscribe")
def unsubscribe(unsubscribe_data: EmailAlertUnsubscribe, db: Session = Depends(get_db)):
    """Unsubscribe from email alerts."""
    alert = crud_email_alert.get_by_unsubscribe_token(db, token=unsubscribe_data.token)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid unsubscribe token",
        )
    
    alert = crud_email_alert.unsubscribe(db, alert=alert)
    return {"message": "Successfully unsubscribed", "email": alert.email}


@router.get("/my-alerts", response_model=list[EmailAlertResponse])
def get_my_alerts(
    current_user: UserAccountResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's email alerts (requires authentication)."""
    # Get alerts for user's email
    from app.db.models.email_alert import EmailAlert
    alerts = db.query(EmailAlert).filter(
        EmailAlert.email == current_user.email
    ).all()
    return [EmailAlertResponse.from_orm(alert) for alert in alerts]


@router.put("/my-alerts/{alert_id}", response_model=EmailAlertResponse)
def update_my_alert(
    alert_id: str,
    alert_update: EmailAlertUpdate,
    current_user: UserAccountResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user's email alert."""
    alert = crud_email_alert.get(db, id=alert_id)
    if not alert or alert.email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )
    
    updated = crud_email_alert.update(db, db_obj=alert, obj_in=alert_update)
    return EmailAlertResponse.from_orm(updated)


@router.delete("/my-alerts/{alert_id}")
def delete_my_alert(
    alert_id: str,
    current_user: UserAccountResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete user's email alert."""
    alert = crud_email_alert.get(db, id=alert_id)
    if not alert or alert.email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )
    
    crud_email_alert.remove(db, id=alert_id)
    return {"message": "Alert deleted successfully"}
