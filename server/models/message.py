from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MessageDirection(str, Enum):
    """Direction of message"""
    OUTBOUND = "outbound"
    INBOUND = "inbound"


class MessageType(str, Enum):
    """Type of message"""
    TEXT = "text"
    TEMPLATE = "template"
    IMAGE = "image"
    DOCUMENT = "document"


class MessageStatus(str, Enum):
    """Status of message (simulated)"""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class ChatThread(BaseModel):
    """Chat thread model"""
    id: str = Field(alias="_id")
    contact_id: str
    user_id: str
    last_message: Optional[str] = None
    unread_count: int = 0
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class MessageBase(BaseModel):
    """Base message model"""
    content: str
    type: MessageType = MessageType.TEXT


class MessageCreate(MessageBase):
    """Message creation model"""
    thread_id: str


class Message(MessageBase):
    """Message response model"""
    id: str = Field(alias="_id")
    thread_id: str
    direction: MessageDirection
    status: MessageStatus
    timestamp: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class MessageInDB(Message):
    """Message model as stored in database"""
    pass


class SendMessageRequest(BaseModel):
    """Request model for sending a message"""
    contact_id: str
    content: str
    type: MessageType = MessageType.TEXT


class SendTemplateRequest(BaseModel):
    """Request model for sending a template message"""
    contact_id: str
    template_id: str
    parameters: dict = {}
