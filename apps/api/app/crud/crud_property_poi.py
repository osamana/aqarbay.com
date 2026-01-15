from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.db.models.property_poi import PropertyPOI


class CRUDPropertyPOI(CRUDBase[PropertyPOI, dict, dict]):
    def get_by_property(self, db: Session, *, property_id: str) -> List[PropertyPOI]:
        """Get all POIs for a property, grouped by category."""
        return db.query(PropertyPOI).filter(
            PropertyPOI.property_id == property_id
        ).order_by(PropertyPOI.category, PropertyPOI.sort_order).all()
    
    def delete_by_property(self, db: Session, *, property_id: str) -> int:
        """Delete all POIs for a property."""
        deleted = db.query(PropertyPOI).filter(
            PropertyPOI.property_id == property_id
        ).delete()
        db.commit()
        return deleted
    
    def create_bulk(self, db: Session, *, pois: List[dict]) -> List[PropertyPOI]:
        """Create multiple POIs at once."""
        db_pois = [PropertyPOI(**poi) for poi in pois]
        db.add_all(db_pois)
        db.commit()
        for poi in db_pois:
            db.refresh(poi)
        return db_pois


crud_property_poi = CRUDPropertyPOI(PropertyPOI)

