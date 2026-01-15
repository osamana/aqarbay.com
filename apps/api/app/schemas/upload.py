from pydantic import BaseModel


class PresignedUploadResponse(BaseModel):
    upload_url: str
    file_key: str
    public_url: str

