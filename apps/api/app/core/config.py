from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # MinIO
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str = "aqarbay"
    MINIO_SECURE: bool = False
    MINIO_PUBLIC_URL: Optional[str] = None  # Public URL for browser access (e.g., https://s3.aqarbay.com)
    
    # Meilisearch (optional)
    MEILI_URL: Optional[str] = None
    MEILI_MASTER_KEY: Optional[str] = None
    
    # CORS
    PUBLIC_WEB_ORIGIN: str = "http://localhost:3000"
    
    # Admin defaults
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

