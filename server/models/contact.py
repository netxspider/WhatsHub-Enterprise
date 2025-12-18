from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ContactSource(str, Enum):
    """Source of contact creation"""
    MANUAL = "manual"
    SHEET = "sheet"
    IMPORT = "import"


class ContactBase(BaseModel):
    """Base contact model"""
    name: str
    phone: str
    tags: List[str] = []
    source: ContactSource = ContactSource.MANUAL


class ContactCreate(ContactBase):
    """Contact creation model"""
    pass


class ContactUpdate(BaseModel):
    """Contact update model"""
    name: Optional[str] = None
    phone: Optional[str] = None
    tags: Optional[List[str]] = None


class Contact(ContactBase):
    """Contact response model"""
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ContactInDB(Contact):
    """Contact model as stored in database"""
    pass


class ContactImportRequest(BaseModel):
    """Request model for importing contacts from Google Sheets"""
    sheet_url: str
    sheet_name: Optional[str] = None
    tags: List[str] = []


class ContactImportResponse(BaseModel):
    """Response model for contact import"""
    total_imported: int
    contacts: List[Contact]
    errors: List[str] = []
