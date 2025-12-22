from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class GroupBase(BaseModel):
    """Base group model"""
    name: str
    description: str = ""
    icon_url: Optional[str] = None


class GroupCreate(GroupBase):
    """Group creation model"""
    community_id: Optional[str] = None  # If part of a community


class Group(GroupBase):
    """Group response model"""
    id: str = Field(alias="_id")
    community_id: Optional[str] = None
    creator_id: str
    members_count: int = 0
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class CommunityBase(BaseModel):
    """Base community model"""
    name: str
    description: str = ""
    icon_url: Optional[str] = None


class CommunityCreate(CommunityBase):
    """Community creation model"""
    pass


class Community(CommunityBase):
    """Community response model"""
    id: str = Field(alias="_id")
    creator_id: str
    members_count: int = 0
    announcement_group_id: str  # Main announcement group
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class CommunityMember(BaseModel):
    """Community member relationship"""
    community_id: str
    user_id: str
    role: str = "member"  # member or admin
    joined_at: datetime
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class GroupMember(BaseModel):
    """Group member relationship"""
    group_id: str
    user_id: str
    role: str = "member"  # member or admin
    joined_at: datetime
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class GroupMessage(BaseModel):
    """Message in a group"""
    id: str = Field(alias="_id")
    group_id: str
    user_id: str
    user_name: str
    content: str
    media_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class GroupMessageCreate(BaseModel):
    """Create group message"""
    content: str
    media_url: Optional[str] = None


class CommunityWithGroups(Community):
    """Community with its groups"""
    groups: List[Group] = []
    is_member: bool = False
    is_admin: bool = False
