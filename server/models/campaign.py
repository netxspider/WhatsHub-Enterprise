from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class CampaignStatus(str, Enum):
    """Status of campaign"""
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"


class CampaignBase(BaseModel):
    """Base campaign model"""
    name: str
    template_id: Optional[str] = None


class CampaignCreate(CampaignBase):
    """Campaign creation model"""
    sheet_url: str
    sheet_name: Optional[str] = None
    template_parameters: dict = {}


class Campaign(CampaignBase):
    """Campaign response model"""
    id: str = Field(alias="_id")
    user_id: str
    status: CampaignStatus
    total_contacts: int = 0
    delivered_count: int = 0
    read_count: int = 0
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class CampaignInDB(Campaign):
    """Campaign model as stored in database"""
    contact_ids: List[str] = []
    message_ids: List[str] = []


class CampaignContact(BaseModel):
    """Contact within a campaign"""
    contact_id: str
    name: str
    phone: str
    message_status: str
    sent_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class CampaignStats(BaseModel):
    """Campaign statistics"""
    campaign_id: str
    total_contacts: int
    sent_count: int
    delivered_count: int
    read_count: int
    failed_count: int
