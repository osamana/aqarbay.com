from minio import Minio
from minio.error import S3Error
from datetime import timedelta
from app.core.config import settings
import uuid


class MinIOService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket_name = settings.MINIO_BUCKET
        self._ensure_bucket()

    def _ensure_bucket(self):
        """Create bucket if it doesn't exist."""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                # Set bucket policy to public read (for property images)
                policy = f"""{{
                    "Version": "2012-10-17",
                    "Statement": [
                        {{
                            "Effect": "Allow",
                            "Principal": {{"AWS": ["*"]}},
                            "Action": ["s3:GetObject"],
                            "Resource": ["arn:aws:s3:::{self.bucket_name}/*"]
                        }}
                    ]
                }}"""
                self.client.set_bucket_policy(self.bucket_name, policy)
        except S3Error as e:
            print(f"Error ensuring bucket: {e}")

    def generate_presigned_upload_url(self, file_extension: str = "jpg") -> dict:
        """Generate a presigned URL for uploading a file."""
        file_key = f"{uuid.uuid4()}.{file_extension}"
        
        try:
            upload_url = self.client.presigned_put_object(
                self.bucket_name,
                file_key,
                expires=timedelta(hours=1)
            )
            
            # Generate public URL using MINIO_PUBLIC_URL if set, otherwise use MINIO_ENDPOINT
            if settings.MINIO_PUBLIC_URL:
                # Use configured public URL (e.g., https://s3.aqarbay.com)
                public_url = f"{settings.MINIO_PUBLIC_URL}/{self.bucket_name}/{file_key}"
            else:
                # Fallback to endpoint-based URL
                protocol = "https" if settings.MINIO_SECURE else "http"
                public_url = f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket_name}/{file_key}"
            
            return {
                "upload_url": upload_url,
                "file_key": file_key,
                "public_url": public_url,
            }
        except S3Error as e:
            raise Exception(f"Error generating presigned URL: {e}")

    def delete_file(self, file_key: str):
        """Delete a file from MinIO."""
        try:
            self.client.remove_object(self.bucket_name, file_key)
        except S3Error as e:
            print(f"Error deleting file {file_key}: {e}")

    def get_public_url(self, file_key: str) -> str:
        """Get the public URL for a file."""
        if settings.MINIO_PUBLIC_URL:
            # Use configured public URL (e.g., https://s3.aqarbay.com)
            return f"{settings.MINIO_PUBLIC_URL}/{self.bucket_name}/{file_key}"
        else:
            # Fallback to endpoint-based URL
            protocol = "https" if settings.MINIO_SECURE else "http"
            return f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket_name}/{file_key}"
    
    def create_bucket_if_not_exists(self):
        """Manually create bucket - useful for initialization."""
        self._ensure_bucket()
        return True


minio_service = MinIOService()

