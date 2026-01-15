"""
Initialize MinIO bucket for AqarBay
Run this after first deployment to ensure bucket exists with correct permissions.
"""
from app.services.minio_service import minio_service

def main():
    """Initialize MinIO bucket."""
    try:
        print("🔧 Initializing MinIO...")
        print(f"📦 Bucket name: {minio_service.bucket_name}")
        
        # Create bucket if it doesn't exist
        minio_service.create_bucket_if_not_exists()
        
        # Check if bucket exists
        if minio_service.client.bucket_exists(minio_service.bucket_name):
            print(f"✅ Bucket '{minio_service.bucket_name}' is ready!")
            print(f"🌐 Public URL base: {minio_service.get_public_url('')}")
        else:
            print(f"❌ Failed to create bucket '{minio_service.bucket_name}'")
            
    except Exception as e:
        print(f"❌ Error initializing MinIO: {e}")
        raise

if __name__ == "__main__":
    main()

