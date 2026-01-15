from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_admin
from app.services.minio_service import minio_service
from app.crud.crud_property_image import crud_property_image
from app.schemas.upload import PresignedUploadResponse
from app.schemas.property import PropertyImageCreate, PropertyImage

router = APIRouter()


@router.post("/presign", response_model=PresignedUploadResponse)
def generate_presigned_upload(
    file_extension: str = Query("jpg", regex="^(jpg|jpeg|png|gif|webp|pdf)$"),
    current_user = Depends(get_current_admin),
):
    """Generate a presigned URL for uploading a file to MinIO."""
    result = minio_service.generate_presigned_upload_url(file_extension)
    return result


@router.post("/property-images", response_model=PropertyImage)
def create_property_image(
    image_in: PropertyImageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Register a property image after upload."""
    return crud_property_image.create(db, obj_in=image_in)


@router.delete("/property-images/{image_id}")
def delete_property_image(
    image_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Delete a property image."""
    image = crud_property_image.get(db, id=image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete from MinIO
    minio_service.delete_file(image.file_key)
    
    # Delete from database
    crud_property_image.remove(db, id=image_id)
    
    return {"message": "Image deleted"}

