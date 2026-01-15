from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_admin
from app.crud.crud_location import crud_location
from app.schemas.location import Location, LocationCreate, LocationUpdate
from app.api.utils import serialize_model_list, serialize_model

router = APIRouter()


@router.get("/")
def list_locations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_admin),
):
    """List all locations."""
    locations = crud_location.get_multi(db, skip=skip, limit=limit)
    return serialize_model_list(locations)


@router.post("/", response_model=Location)
def create_location(
    location_in: LocationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Create a new location."""
    return crud_location.create(db, obj_in=location_in)


@router.get("/{location_id}", response_model=Location)
def get_location(
    location_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Get location by ID."""
    location = crud_location.get(db, id=location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


@router.put("/{location_id}", response_model=Location)
def update_location(
    location_id: str,
    location_in: LocationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Update a location."""
    location = crud_location.get(db, id=location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    return crud_location.update(db, db_obj=location, obj_in=location_in)


@router.delete("/{location_id}")
def delete_location(
    location_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Delete a location."""
    location = crud_location.get(db, id=location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    crud_location.remove(db, id=location_id)
    return {"message": "Location deleted"}

