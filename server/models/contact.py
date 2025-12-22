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
    email: Optional[str] = None
    tags: List[str] = []
    source: ContactSource = ContactSource.MANUAL


class ContactCreate(ContactBase):
    """Contact creation model"""
    pass


class ContactUpdate(BaseModel):
    """Contact update model"""
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tags: Optional[List[str]] = None


class Contact(ContactBase):
    """Contact response model"""
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
        # This ensures id is serialized when sent to frontend
        by_alias = False  # Use field name 'id' not alias '_id'
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


class ContactRelationship(BaseModel):
    """Bidirectional contact relationship model"""
    id: str = Field(alias="_id")
    user_id: str
    contact_user_id: str  # Must be a registered user
    contact_name: str
    contact_phone: str
    contact_email: Optional[str] = None
    is_blocked: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ContactRelationshipInDB(ContactRelationship):
    """Contact relationship model as stored in database"""
    pass


class AddContactRequest(BaseModel):
    """Request model for adding a contact"""
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None  # Custom display name
    
    def __init__(self, **data):
        super().__init__(**data)
        # Validate that at least one of email or phone is provided
        if not self.email and not self.phone:
            raise ValueError("Either email or phone must be provided")


class ContactSearchResponse(BaseModel):
    """Response model for contact search"""
    contacts: List[ContactRelationship]
    total: int
