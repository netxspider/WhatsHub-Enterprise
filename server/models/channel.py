from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChannelBase(BaseModel):
    """Base channel model"""
    name: str
    description: str = ""
    avatar_url: Optional[str] = None


class ChannelCreate(ChannelBase):
    """Channel creation model"""
    pass


class Channel(ChannelBase):
    """Channel response model"""
    id: str = Field(alias="_id")
    creator_id: str
    followers_count: int = 0
    verified: bool = False
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ChannelInDB(Channel):
    """Channel model as stored in database"""
    pass


class ChannelFollower(BaseModel):
    """Channel follower relationship"""
    channel_id: str
    user_id: str
    joined_at: datetime
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class ChannelMessage(BaseModel):
    """Message in a channel"""
    id: str = Field(alias="_id")
    channel_id: str
    content: str
    media_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ChannelMessageCreate(BaseModel):
    """Create channel message"""
    content: str
    media_url: Optional[str] = None


class ChannelWithFollowStatus(Channel):
    """Channel with user's follow status"""
    is_following: bool = False
    is_creator: bool = False
