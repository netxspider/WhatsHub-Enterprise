from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MediaType(str, Enum):
    """Type of media file"""
    IMAGE = "image"
    DOCUMENT = "document"
    AUDIO = "audio"
    VIDEO = "video"


class MediaFileBase(BaseModel):
    """Base media file model"""
    file_type: MediaType
    file_name: str
    mime_type: str
    file_size: int  # in bytes


class MediaFile(MediaFileBase):
    """Media file response model"""
    id: str = Field(alias="_id")
    user_id: str
    message_id: Optional[str] = None
    file_path: str
    file_url: str
    thumbnail_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class MediaFileInDB(MediaFile):
    """Media file model as stored in database"""
    pass


class MediaUploadResponse(BaseModel):
    """Response model for media upload"""
    file_url: str
    thumbnail_url: Optional[str] = None
    file_type: MediaType
    file_size: int
    file_name: str
