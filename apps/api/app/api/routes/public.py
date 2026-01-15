from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_db
from app.crud.crud_property import crud_property
from app.crud.crud_location import crud_location
from app.crud.crud_settings import crud_settings
from app.crud.crud_lead import crud_lead
from app.schemas.property import Property
from app.schemas.location import Location
from app.schemas.settings import Settings
from app.schemas.lead import LeadCreate, Lead
from app.api.utils import serialize_model, serialize_model_list
from app.services.osm_service import osm_service, POI_CATEGORIES
from app.services.meilisearch_service import meilisearch_service

router = APIRouter()


@router.get("/settings")
def get_public_settings(db: Session = Depends(get_db)):
    """Get public site settings."""
    settings = crud_settings.get_or_create(db)
    return serialize_model(settings)


@router.get("/locations")
def get_locations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all locations."""
    locations = crud_location.get_multi(db, skip=skip, limit=limit)
    return serialize_model_list(locations)


@router.get("/properties", response_model=dict)
def get_properties(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,  # Search query for Meilisearch
    purpose: Optional[str] = None,
    type: Optional[str] = None,  # Can be comma-separated string for multiple types
    location_slug: Optional[str] = None,  # Can be comma-separated string for multiple locations
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
    sort_by: str = "newest",
):
    """
    Get filtered properties with pagination.
    
    If 'q' (search query) is provided, uses Meilisearch for full-text search.
    Otherwise, uses database filtering.
    
    Sort options: newest, price_asc, price_desc
    
    Advanced filters:
    - bathrooms: Minimum number of bathrooms
    - min_area/max_area: Area range in square meters
    - year_built: Minimum year built
    - furnished: true/false
    - parking: true/false
    - floor: Specific floor number
    """
    skip = (page - 1) * page_size
    
    # Parse multiple types and locations if provided as comma-separated strings
    types_list = None
    if type:
        types_list = [t.strip() for t in type.split(',') if t.strip()]
        if len(types_list) == 1:
            types_list = types_list[0]  # Use single value for backward compatibility
    
    locations_list = None
    if location_slug:
        locations_list = [l.strip() for l in location_slug.split(',') if l.strip()]
        if len(locations_list) == 1:
            locations_list = locations_list[0]  # Use single value for backward compatibility
    
    # Use Meilisearch if search query is provided
    if q and meilisearch_service.is_available():
        return _search_properties_meilisearch(
            db=db,
            query=q,
            page=page,
            page_size=page_size,
            purpose=purpose,
            type=types_list or type,
            location_slug=locations_list or location_slug,
            min_price=min_price,
            max_price=max_price,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            min_area=min_area,
            max_area=max_area,
            year_built=year_built,
            furnished=furnished,
            parking=parking,
            floor=floor,
            featured=featured,
            sort_by=sort_by,
        )
    
    properties = crud_property.get_filtered(
        db,
        skip=skip,
        limit=page_size,
        purpose=purpose,
        type=types_list or type,
        location_slug=locations_list or location_slug,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        min_area=min_area,
        max_area=max_area,
        year_built=year_built,
        furnished=furnished,
        parking=parking,
        floor=floor,
        featured=featured,
        published=True,
        sort_by=sort_by,
    )
    
    total = crud_property.count_filtered(
        db,
        purpose=purpose,
        type=types_list or type,
        location_slug=locations_list or location_slug,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        min_area=min_area,
        max_area=max_area,
        year_built=year_built,
        furnished=furnished,
        parking=parking,
        floor=floor,
        featured=featured,
        published=True,
    )
    
    # Format response with first image
    formatted_properties = []
    for prop in properties:
        prop_dict = {
            "id": str(prop.id),
            "title_en": prop.title_en,
            "title_ar": prop.title_ar,
            "slug_en": prop.slug_en,
            "slug_ar": prop.slug_ar,
            "description_en": prop.description_en,
            "description_ar": prop.description_ar,
            "purpose": prop.purpose.value if hasattr(prop.purpose, 'value') else prop.purpose,
            "type": prop.type.value if hasattr(prop.type, 'value') else prop.type,
            "status": prop.status.value if hasattr(prop.status, 'value') else prop.status,
            "price_amount": float(prop.price_amount),
            "price_currency": prop.price_currency.value if hasattr(prop.price_currency, 'value') else prop.price_currency,
            "area_m2": float(prop.area_m2) if prop.area_m2 else None,
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "furnished": prop.furnished,
            "parking": prop.parking,
            "floor": prop.floor,
            "year_built": prop.year_built,
            "lat": float(prop.lat) if prop.lat else None,
            "lng": float(prop.lng) if prop.lng else None,
            "featured": prop.featured,
            "published": prop.published,
            "location_id": str(prop.location_id),
            "agent_id": str(prop.agent_id) if prop.agent_id else None,
            "created_at": prop.created_at.isoformat(),
            "updated_at": prop.updated_at.isoformat(),
            "first_image": prop.images[0].file_key if prop.images else None,
            "location_name": prop.location.name_en if prop.location else None,
        }
        formatted_properties.append(prop_dict)
    
    return {
        "items": formatted_properties,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/properties/{slug}", response_model=dict)
def get_property_by_slug(
    slug: str,
    locale: str = Query("en", regex="^(en|ar)$"),
    db: Session = Depends(get_db),
):
    """Get property details by slug."""
    prop = crud_property.get_by_slug(db, slug=slug, locale=locale)
    
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Format response with relations
    return {
        "id": str(prop.id),
        "title_en": prop.title_en,
        "title_ar": prop.title_ar,
        "slug_en": prop.slug_en,
        "slug_ar": prop.slug_ar,
        "description_en": prop.description_en,
        "description_ar": prop.description_ar,
        "purpose": prop.purpose.value if hasattr(prop.purpose, 'value') else prop.purpose,
        "type": prop.type.value if hasattr(prop.type, 'value') else prop.type,
        "status": prop.status.value if hasattr(prop.status, 'value') else prop.status,
        "price_amount": float(prop.price_amount),
        "price_currency": prop.price_currency.value if hasattr(prop.price_currency, 'value') else prop.price_currency,
        "area_m2": float(prop.area_m2) if prop.area_m2 else None,
        "bedrooms": prop.bedrooms,
        "bathrooms": prop.bathrooms,
        "furnished": prop.furnished,
        "parking": prop.parking,
        "floor": prop.floor,
        "year_built": prop.year_built,
        "video_url": prop.video_url,
        "lat": float(prop.lat) if prop.lat else None,
        "lng": float(prop.lng) if prop.lng else None,
        "show_exact_location": prop.show_exact_location,
        "featured": prop.featured,
        "published": prop.published,
        "location_id": str(prop.location_id),
        "agent_id": str(prop.agent_id) if prop.agent_id else None,
        "created_at": prop.created_at.isoformat(),
        "updated_at": prop.updated_at.isoformat(),
        "images": [{
            "id": str(img.id),
            "file_key": img.file_key,
            "alt_en": img.alt_en,
            "alt_ar": img.alt_ar,
            "sort_order": img.sort_order,
        } for img in prop.images],
        "location": {
            "id": str(prop.location.id),
            "name_en": prop.location.name_en,
            "name_ar": prop.location.name_ar,
            "slug_en": prop.location.slug_en,
            "slug_ar": prop.location.slug_ar,
        } if prop.location else None,
        "agent": {
            "id": str(prop.agent.id),
            "name": prop.agent.name,
            "phone": prop.agent.phone,
            "whatsapp": prop.agent.whatsapp,
            "email": prop.agent.email,
        } if prop.agent else None,
    }


@router.post("/leads", response_model=Lead)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
):
    """Submit a contact/inquiry lead."""
    return crud_lead.create(db, obj_in=lead_in)


@router.get("/properties/{slug}/nearby-pois")
def get_property_nearby_pois(
    slug: str,
    locale: str = Query("en", regex="^(en|ar)$"),
    db: Session = Depends(get_db),
):
    """
    Get nearby Points of Interest (POIs) for a property from the database cache.
    
    Returns cached nearby schools, mosques, hospitals, supermarkets, banks, restaurants, parks, and gas stations.
    """
    from app.crud.crud_property_poi import crud_property_poi
    
    prop = crud_property.get_by_slug(db, slug=slug, locale=locale)
    
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if not prop.lat or not prop.lng:
        raise HTTPException(
            status_code=400, 
            detail="Property does not have coordinates. Please add lat/lng to the property."
        )
    
    # Get cached POIs from database
    pois_list = crud_property_poi.get_by_property(db, property_id=str(prop.id))
    
    # Group POIs by category
    pois_by_category = {}
    for poi in pois_list:
        category = poi.category
        if category not in pois_by_category:
            pois_by_category[category] = []
        
        # Use locale-appropriate name
        name = poi.name_ar if locale == "ar" and poi.name_ar else (poi.name_en if poi.name_en else poi.name)
        
        pois_by_category[category].append({
            "name": name,
            "name_en": poi.name_en or poi.name,
            "name_ar": poi.name_ar or poi.name,
            "lat": float(poi.lat),
            "lng": float(poi.lng),
            "distance": float(poi.distance),
            "type": poi.poi_type,
            "address": poi.address,
        })
    
    return {
        "property_id": str(prop.id),
        "property_title_en": prop.title_en,
        "property_title_ar": prop.title_ar,
        "coordinates": {
            "lat": float(prop.lat),
            "lng": float(prop.lng),
        },
        "pois": pois_by_category,
    }


def _search_properties_meilisearch(
    db: Session,
    query: str,
    page: int,
    page_size: int,
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
    sort_by: str = "newest",
) -> dict:
    """Search properties using Meilisearch."""
    skip = (page - 1) * page_size
    
    # Build filters
    filters = {}
    if purpose:
        filters["purpose"] = purpose
    if type:
        filters["type"] = type
    if featured is not None:
        filters["featured"] = featured
    filters["published"] = True  # Always filter published
    
    if location_slug:
        # Get location to find its ID
        location = crud_location.get_by_slug(db, slug=location_slug)
        if location:
            filters["location_id"] = str(location.id)
    
    # Build sort
    sort = []
    if sort_by == "price_asc":
        sort.append("price_amount:asc")
    elif sort_by == "price_desc":
        sort.append("price_amount:desc")
    else:
        sort.append("created_at:desc")
    
    # Perform search
    results = meilisearch_service.search(
        query=query,
        filters=filters,
        sort=sort,
        limit=page_size,
        offset=skip,
    )
    
    # Get property IDs from search results
    property_ids = [hit["id"] for hit in results["hits"]]
    
    # Fetch full property data from database
    properties = []
    if property_ids:
        # Get properties in order of search results
        props_dict = {str(p.id): p for p in crud_property.get_multi_by_ids(db, ids=property_ids)}
        properties = [props_dict[pid] for pid in property_ids if pid in props_dict]
    
    # Format response
    formatted_properties = []
    for prop in properties:
        prop_dict = {
            "id": str(prop.id),
            "title_en": prop.title_en,
            "title_ar": prop.title_ar,
            "slug_en": prop.slug_en,
            "slug_ar": prop.slug_ar,
            "description_en": prop.description_en,
            "description_ar": prop.description_ar,
            "purpose": prop.purpose.value if hasattr(prop.purpose, 'value') else prop.purpose,
            "type": prop.type.value if hasattr(prop.type, 'value') else prop.type,
            "status": prop.status.value if hasattr(prop.status, 'value') else prop.status,
            "price_amount": float(prop.price_amount),
            "price_currency": prop.price_currency.value if hasattr(prop.price_currency, 'value') else prop.price_currency,
            "area_m2": float(prop.area_m2) if prop.area_m2 else None,
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "furnished": prop.furnished,
            "parking": prop.parking,
            "floor": prop.floor,
            "year_built": prop.year_built,
            "lat": float(prop.lat) if prop.lat else None,
            "lng": float(prop.lng) if prop.lng else None,
            "featured": prop.featured,
            "published": prop.published,
            "location_id": str(prop.location_id),
            "agent_id": str(prop.agent_id) if prop.agent_id else None,
            "created_at": prop.created_at.isoformat(),
            "updated_at": prop.updated_at.isoformat(),
            "first_image": prop.images[0].file_key if prop.images else None,
            "location_name": prop.location.name_en if prop.location else None,
        }
        formatted_properties.append(prop_dict)
    
    return {
        "items": formatted_properties,
        "total": results["total"],
        "page": page,
        "page_size": page_size,
        "total_pages": (results["total"] + page_size - 1) // page_size,
    }

