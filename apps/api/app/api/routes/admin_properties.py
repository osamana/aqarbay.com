from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_db, get_current_admin
from app.crud.crud_property import crud_property
from app.crud.crud_property_poi import crud_property_poi
from app.schemas.property import Property, PropertyCreate, PropertyUpdate
from app.api.utils import serialize_model_list, serialize_model
from app.services.osm_service import osm_service
from app.services.meilisearch_service import meilisearch_service
from slugify import slugify
import asyncio
import csv
import io
from pydantic import BaseModel
from uuid import UUID

router = APIRouter()


def fetch_and_cache_pois(property_id: str, lat: float, lng: float):
    """Background task to fetch and cache POIs for a property."""
    import asyncio
    from app.db.session import SessionLocal
    
    async def _fetch():
        db = SessionLocal()
        try:
            # Fetch POIs from OSM
            pois_data = await osm_service.get_nearby_pois(
                lat=lat,
                lng=lng,
                radius=1000,  # 1km radius
                categories=None,  # All categories
                limit_per_category=10,
            )
            
            # Delete existing POIs for this property
            crud_property_poi.delete_by_property(db, property_id=property_id)
            
            # Prepare POIs for bulk insert
            pois_to_create = []
            for category, pois_list in pois_data.items():
                for idx, poi in enumerate(pois_list):
                    pois_to_create.append({
                        "property_id": property_id,
                        "category": category,
                        "name": poi.get("name", ""),
                        "name_en": poi.get("name_en"),
                        "name_ar": poi.get("name_ar"),
                        "lat": poi.get("lat"),
                        "lng": poi.get("lng"),
                        "distance": poi.get("distance", 0),
                        "poi_type": poi.get("type"),
                        "address": poi.get("address"),
                        "sort_order": idx,
                    })
            
            # Bulk create POIs
            if pois_to_create:
                crud_property_poi.create_bulk(db, pois=pois_to_create)
        except Exception as e:
            print(f"Error fetching POIs for property {property_id}: {e}")
        finally:
            db.close()
    
    # Run async function
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If loop is running, create a task
            asyncio.create_task(_fetch())
        else:
            loop.run_until_complete(_fetch())
    except RuntimeError:
        # No event loop, create a new one
        asyncio.run(_fetch())


@router.get("/")
def list_properties(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin),
):
    """List all properties (admin)."""
    properties = crud_property.get_multi(db, skip=skip, limit=limit)
    return serialize_model_list(properties)


@router.post("/", response_model=Property)
def create_property(
    property_in: PropertyCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Create a new property."""
    # Auto-generate slugs if not provided
    if not property_in.slug_en:
        property_in.slug_en = slugify(property_in.title_en)
    if not property_in.slug_ar:
        property_in.slug_ar = slugify(property_in.title_ar, allow_unicode=True)
    
    prop = crud_property.create(db, obj_in=property_in)
    
    # Index in Meilisearch
    if meilisearch_service.is_available():
        prop_dict = {
            "id": str(prop.id),
            "title_en": prop.title_en,
            "title_ar": prop.title_ar,
            "slug_en": prop.slug_en,
            "slug_ar": prop.slug_ar,
            "description_en": prop.description_en,
            "description_ar": prop.description_ar,
            "purpose": prop.purpose.value,
            "type": prop.type.value,
            "status": prop.status.value,
            "price_amount": float(prop.price_amount),
            "price_currency": prop.price_currency.value,
            "area_m2": float(prop.area_m2) if prop.area_m2 else None,
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "furnished": prop.furnished,
            "parking": prop.parking,
            "floor": prop.floor,
            "year_built": prop.year_built,
            "featured": prop.featured,
            "published": prop.published,
            "location_id": str(prop.location_id),
            "location_name_en": prop.location.name_en if prop.location else "",
            "location_name_ar": prop.location.name_ar if prop.location else "",
            "location_slug_en": prop.location.slug_en if prop.location else "",
            "location_slug_ar": prop.location.slug_ar if prop.location else "",
            "agent_id": str(prop.agent_id) if prop.agent_id else None,
            "created_at": prop.created_at.isoformat(),
        }
        meilisearch_service.index_property(prop_dict)
    
    # Fetch and cache POIs in background if coordinates are present
    if prop.lat and prop.lng:
        background_tasks.add_task(
            fetch_and_cache_pois,
            property_id=str(prop.id),
            lat=float(prop.lat),
            lng=float(prop.lng)
        )
    
    return prop


@router.get("/{property_id}")
def get_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Get property by ID."""
    prop = crud_property.get(db, id=property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return serialize_model(prop)


@router.put("/{property_id}", response_model=Property)
def update_property(
    property_id: str,
    property_in: PropertyUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Update a property."""
    prop = crud_property.get(db, id=property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check if coordinates changed
    old_lat = prop.lat
    old_lng = prop.lng
    update_data = property_in.dict(exclude_unset=True) if hasattr(property_in, 'dict') else {}
    new_lat = update_data.get("lat", old_lat)
    new_lng = update_data.get("lng", old_lng)
    coordinates_changed = (old_lat != new_lat) or (old_lng != new_lng)
    
    prop = crud_property.update(db, db_obj=prop, obj_in=property_in)
    
    # Update in Meilisearch
    if meilisearch_service.is_available():
        prop_dict = {
            "id": str(prop.id),
            "title_en": prop.title_en,
            "title_ar": prop.title_ar,
            "slug_en": prop.slug_en,
            "slug_ar": prop.slug_ar,
            "description_en": prop.description_en,
            "description_ar": prop.description_ar,
            "purpose": prop.purpose.value,
            "type": prop.type.value,
            "status": prop.status.value,
            "price_amount": float(prop.price_amount),
            "price_currency": prop.price_currency.value,
            "area_m2": float(prop.area_m2) if prop.area_m2 else None,
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "furnished": prop.furnished,
            "parking": prop.parking,
            "floor": prop.floor,
            "year_built": prop.year_built,
            "featured": prop.featured,
            "published": prop.published,
            "location_id": str(prop.location_id),
            "location_name_en": prop.location.name_en if prop.location else "",
            "location_name_ar": prop.location.name_ar if prop.location else "",
            "location_slug_en": prop.location.slug_en if prop.location else "",
            "location_slug_ar": prop.location.slug_ar if prop.location else "",
            "agent_id": str(prop.agent_id) if prop.agent_id else None,
            "created_at": prop.created_at.isoformat(),
        }
        meilisearch_service.update_property(prop_dict)
    
    # Fetch and cache POIs in background if coordinates changed or were newly set
    if coordinates_changed and prop.lat and prop.lng:
        background_tasks.add_task(
            fetch_and_cache_pois,
            property_id=str(prop.id),
            lat=float(prop.lat),
            lng=float(prop.lng)
        )
    
    return prop


@router.delete("/{property_id}")
def delete_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Delete a property."""
    prop = crud_property.get(db, id=property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Delete from Meilisearch
    if meilisearch_service.is_available():
        meilisearch_service.delete_property(property_id)
    
    crud_property.remove(db, id=property_id)
    return {"message": "Property deleted"}


@router.post("/{property_id}/publish")
def publish_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Publish a property."""
    prop = crud_property.get(db, id=property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    crud_property.update(db, db_obj=prop, obj_in={"published": True})
    return {"message": "Property published"}


@router.post("/{property_id}/unpublish")
def unpublish_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Unpublish a property."""
    prop = crud_property.get(db, id=property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    crud_property.update(db, db_obj=prop, obj_in={"published": False})
    return {"message": "Property unpublished"}


class BulkOperationRequest(BaseModel):
    property_ids: List[str]
    operation: str  # "publish", "unpublish", "delete", "set_status", "set_featured"
    value: Optional[str] = None  # For set_status, set_featured


@router.post("/bulk")
def bulk_operations(
    request: BulkOperationRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """
    Perform bulk operations on properties.
    
    Operations:
    - publish: Publish selected properties
    - unpublish: Unpublish selected properties
    - delete: Delete selected properties
    - set_status: Set status (value: available, reserved, sold, rented)
    - set_featured: Set featured (value: true/false)
    """
    properties = []
    for prop_id in request.property_ids:
        prop = crud_property.get(db, id=prop_id)
        if prop:
            properties.append(prop)
    
    if not properties:
        raise HTTPException(status_code=404, detail="No valid properties found")
    
    updated_count = 0
    
    if request.operation == "publish":
        for prop in properties:
            crud_property.update(db, db_obj=prop, obj_in={"published": True})
            updated_count += 1
    
    elif request.operation == "unpublish":
        for prop in properties:
            crud_property.update(db, db_obj=prop, obj_in={"published": False})
            updated_count += 1
    
    elif request.operation == "delete":
        for prop in properties:
            crud_property.remove(db, id=str(prop.id))
            updated_count += 1
    
    elif request.operation == "set_status":
        if not request.value:
            raise HTTPException(status_code=400, detail="Status value required")
        for prop in properties:
            crud_property.update(db, db_obj=prop, obj_in={"status": request.value})
            updated_count += 1
    
    elif request.operation == "set_featured":
        if request.value is None:
            raise HTTPException(status_code=400, detail="Featured value required")
        featured_value = request.value.lower() == "true"
        for prop in properties:
            crud_property.update(db, db_obj=prop, obj_in={"featured": featured_value})
            updated_count += 1
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown operation: {request.operation}")
    
    return {
        "message": f"Bulk operation '{request.operation}' completed",
        "updated_count": updated_count,
        "total_requested": len(request.property_ids),
    }


@router.post("/{property_id}/duplicate")
def duplicate_property(
    property_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Duplicate an existing property."""
    original_prop = crud_property.get(db, id=property_id)
    if not original_prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Create new property data from original
    property_data = PropertyCreate(
        title_en=f"{original_prop.title_en} (Copy)",
        title_ar=f"{original_prop.title_ar} (نسخة)",
        slug_en=f"{original_prop.slug_en}-copy",
        slug_ar=f"{original_prop.slug_ar}-copy",
        description_en=original_prop.description_en,
        description_ar=original_prop.description_ar,
        purpose=original_prop.purpose.value,
        type=original_prop.type.value,
        status=original_prop.status.value,
        price_amount=float(original_prop.price_amount),
        price_currency=original_prop.price_currency.value,
        area_m2=float(original_prop.area_m2) if original_prop.area_m2 else None,
        bedrooms=original_prop.bedrooms,
        bathrooms=original_prop.bathrooms,
        furnished=original_prop.furnished,
        parking=original_prop.parking,
        floor=original_prop.floor,
        year_built=original_prop.year_built,
        video_url=original_prop.video_url,
        lat=float(original_prop.lat) if original_prop.lat else None,
        lng=float(original_prop.lng) if original_prop.lng else None,
        show_exact_location=original_prop.show_exact_location,
        featured=False,  # Don't copy featured status
        published=False,  # Don't copy published status
        location_id=str(original_prop.location_id),
        agent_id=str(original_prop.agent_id) if original_prop.agent_id else None,
    )
    
    # Create the duplicate property
    new_prop = crud_property.create(db, obj_in=property_data)
    
    # Copy images (create new PropertyImage records)
    from app.crud.crud_property_image import crud_property_image
    for img in original_prop.images:
        crud_property_image.create(db, obj_in={
            "property_id": str(new_prop.id),
            "file_key": img.file_key,
            "alt_en": img.alt_en,
            "alt_ar": img.alt_ar,
            "sort_order": img.sort_order,
        })
    
    # Fetch POIs if coordinates exist
    if new_prop.lat and new_prop.lng:
        background_tasks.add_task(
            fetch_and_cache_pois,
            property_id=str(new_prop.id),
            lat=float(new_prop.lat),
            lng=float(new_prop.lng)
        )
    
    return serialize_model(new_prop)


@router.get("/export/csv")
def export_properties_csv(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
    published_only: bool = Query(False),
):
    """Export properties to CSV."""
    if published_only:
        properties = db.query(crud_property.model).filter(
            crud_property.model.published == True
        ).all()
    else:
        properties = crud_property.get_multi(db, skip=0, limit=10000)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Title (EN)", "Title (AR)", "Purpose", "Type", "Status",
        "Price", "Currency", "Area (m²)", "Bedrooms", "Bathrooms",
        "Furnished", "Parking", "Floor", "Year Built",
        "Location", "Agent", "Featured", "Published", "Created At"
    ])
    
    # Write data
    for prop in properties:
        writer.writerow([
            str(prop.id),
            prop.title_en,
            prop.title_ar,
            prop.purpose.value,
            prop.type.value,
            prop.status.value,
            float(prop.price_amount),
            prop.price_currency.value,
            float(prop.area_m2) if prop.area_m2 else "",
            prop.bedrooms or "",
            prop.bathrooms or "",
            "Yes" if prop.furnished else "No",
            "Yes" if prop.parking else "No",
            prop.floor or "",
            prop.year_built or "",
            prop.location.name_en if prop.location else "",
            prop.agent.name if prop.agent else "",
            "Yes" if prop.featured else "No",
            "Yes" if prop.published else "No",
            prop.created_at.isoformat(),
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=properties_export.csv"
        }
    )

