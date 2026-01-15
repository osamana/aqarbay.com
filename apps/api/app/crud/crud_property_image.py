from typing import List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.db.models.property_image import PropertyImage
from app.schemas.property import PropertyImageCreate, PropertyImageBase


class CRUDPropertyImage(CRUDBase[PropertyImage, PropertyImageCreate, PropertyImageBase]):
    def get_by_property(self, db: Session, *, property_id: str) -> List[PropertyImage]:
        return db.query(PropertyImage).filter(
            PropertyImage.property_id == property_id
        ).order_by(PropertyImage.sort_order).all()


crud_property_image = CRUDPropertyImage(PropertyImage)

