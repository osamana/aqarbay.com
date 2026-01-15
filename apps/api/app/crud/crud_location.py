from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.db.models.location import Location
from app.schemas.location import LocationCreate, LocationUpdate


class CRUDLocation(CRUDBase[Location, LocationCreate, LocationUpdate]):
    def get_by_slug(self, db: Session, *, slug: str, locale: str = "en") -> Optional[Location]:
        if locale == "ar":
            return db.query(Location).filter(Location.slug_ar == slug).first()
        return db.query(Location).filter(Location.slug_en == slug).first()


crud_location = CRUDLocation(Location)

