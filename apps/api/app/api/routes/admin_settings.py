from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_admin
from app.crud.crud_settings import crud_settings
from app.schemas.settings import Settings, SettingsUpdate
from app.api.utils import serialize_model

router = APIRouter()


@router.get("/")
def get_settings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Get site settings."""
    settings = crud_settings.get_or_create(db)
    return serialize_model(settings)


@router.put("/", response_model=Settings)
def update_settings(
    settings_in: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Update site settings."""
    settings = crud_settings.get_or_create(db)
    return crud_settings.update(db, db_obj=settings, obj_in=settings_in)

