from typing import Optional, List, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.crud.base import CRUDBase
from app.db.models.property import Property
from app.db.models.location import Location
from app.schemas.property import PropertyCreate, PropertyUpdate


class CRUDProperty(CRUDBase[Property, PropertyCreate, PropertyUpdate]):
    def get_by_slug(self, db: Session, *, slug: str, locale: str = "en") -> Optional[Property]:
        if locale == "ar":
            return db.query(Property).filter(
                and_(Property.slug_ar == slug, Property.published == True)
            ).first()
        return db.query(Property).filter(
            and_(Property.slug_en == slug, Property.published == True)
        ).first()

    def get_filtered(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 20,
        purpose: Optional[str] = None,
        type: Optional[str] = None,
        location_slug: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[int] = None,
        min_area: Optional[float] = None,
        max_area: Optional[float] = None,
        year_built: Optional[int] = None,
        furnished: Optional[bool] = None,
        parking: Optional[bool] = None,
        floor: Optional[int] = None,
        featured: Optional[bool] = None,
        published: bool = True,
        sort_by: str = "newest",
    ) -> List[Property]:
        query = db.query(Property)

        # Always filter by published status
        query = query.filter(Property.published == published)

        if purpose:
            query = query.filter(Property.purpose == purpose)

        if type:
            if isinstance(type, list):
                query = query.filter(Property.type.in_(type))
            else:
                query = query.filter(Property.type == type)

        if location_slug:
            if isinstance(location_slug, list):
                query = query.join(Location).filter(
                    or_(
                        Location.slug_en.in_(location_slug),
                        Location.slug_ar.in_(location_slug)
                    )
                )
            else:
                query = query.join(Location).filter(
                    or_(Location.slug_en == location_slug, Location.slug_ar == location_slug)
                )

        if min_price is not None:
            query = query.filter(Property.price_amount >= min_price)

        if max_price is not None:
            query = query.filter(Property.price_amount <= max_price)

        if bedrooms is not None:
            query = query.filter(Property.bedrooms >= bedrooms)

        if bathrooms is not None:
            query = query.filter(Property.bathrooms >= bathrooms)

        if min_area is not None:
            query = query.filter(Property.area_m2 >= min_area)

        if max_area is not None:
            query = query.filter(Property.area_m2 <= max_area)

        if year_built is not None:
            query = query.filter(Property.year_built >= year_built)

        if furnished is not None:
            query = query.filter(Property.furnished == furnished)

        if parking is not None:
            query = query.filter(Property.parking == parking)

        if floor is not None:
            query = query.filter(Property.floor == floor)

        if featured is not None:
            query = query.filter(Property.featured == featured)

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(Property.price_amount.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Property.price_amount.desc())
        else:  # newest
            query = query.order_by(Property.created_at.desc())

        return query.offset(skip).limit(limit).all()

    def count_filtered(
        self,
        db: Session,
        *,
        purpose: Optional[str] = None,
        type: Optional[Union[str, List[str]]] = None,
        location_slug: Optional[Union[str, List[str]]] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[int] = None,
        min_area: Optional[float] = None,
        max_area: Optional[float] = None,
        year_built: Optional[int] = None,
        furnished: Optional[bool] = None,
        parking: Optional[bool] = None,
        floor: Optional[int] = None,
        featured: Optional[bool] = None,
        published: bool = True,
    ) -> int:
        query = db.query(Property)

        query = query.filter(Property.published == published)

        if purpose:
            query = query.filter(Property.purpose == purpose)

        if type:
            if isinstance(type, list):
                query = query.filter(Property.type.in_(type))
            else:
                query = query.filter(Property.type == type)

        if location_slug:
            if isinstance(location_slug, list):
                query = query.join(Location).filter(
                    or_(
                        Location.slug_en.in_(location_slug),
                        Location.slug_ar.in_(location_slug)
                    )
                )
            else:
                query = query.join(Location).filter(
                    or_(Location.slug_en == location_slug, Location.slug_ar == location_slug)
                )

        if min_price is not None:
            query = query.filter(Property.price_amount >= min_price)

        if max_price is not None:
            query = query.filter(Property.price_amount <= max_price)

        if bedrooms is not None:
            query = query.filter(Property.bedrooms >= bedrooms)

        if bathrooms is not None:
            query = query.filter(Property.bathrooms >= bathrooms)

        if min_area is not None:
            query = query.filter(Property.area_m2 >= min_area)

        if max_area is not None:
            query = query.filter(Property.area_m2 <= max_area)

        if year_built is not None:
            query = query.filter(Property.year_built >= year_built)

        if furnished is not None:
            query = query.filter(Property.furnished == furnished)

        if parking is not None:
            query = query.filter(Property.parking == parking)

        if floor is not None:
            query = query.filter(Property.floor == floor)

        if featured is not None:
            query = query.filter(Property.featured == featured)

        return query.count()
    
    def get_multi_by_ids(self, db: Session, *, ids: List[str]) -> List[Property]:
        """Get multiple properties by their IDs."""
        from sqlalchemy import or_
        from uuid import UUID
        
        # Convert string IDs to UUIDs
        uuid_ids = []
        for id_str in ids:
            try:
                uuid_ids.append(UUID(id_str))
            except ValueError:
                continue
        
        if not uuid_ids:
            return []
        
        return db.query(Property).filter(
            Property.id.in_(uuid_ids)
        ).all()


crud_property = CRUDProperty(Property)

