from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.db.models.settings import Settings
from app.schemas.settings import SettingsBase, SettingsUpdate


class CRUDSettings(CRUDBase[Settings, SettingsBase, SettingsUpdate]):
    def get_settings(self, db: Session) -> Optional[Settings]:
        """Get the single settings row (there should only be one)."""
        return db.query(Settings).first()

    def get_or_create(self, db: Session) -> Settings:
        """Get settings or create default if not exists."""
        settings = self.get_settings(db)
        if not settings:
            settings = Settings()
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings


crud_settings = CRUDSettings(Settings)

