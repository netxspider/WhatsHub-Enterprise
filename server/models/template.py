from pydantic import BaseModel, Field
from typing import List
from enum import Enum


class TemplateCategory(str, Enum):
    """Template category"""
    MARKETING = "marketing"
    UTILITY = "utility"
    AUTHENTICATION = "authentication"
    TRANSACTIONAL = "transactional"


class TemplateStatus(str, Enum):
    """Template approval status"""
    APPROVED = "approved"
    PENDING = "pending"
    REJECTED = "rejected"


class TemplateParameter(BaseModel):
    """Template parameter definition"""
    name: str
    example: str


class Template(BaseModel):
    """Template model"""
    id: str = Field(alias="_id")
    name: str
    category: TemplateCategory
    content: str
    parameters: List[TemplateParameter] = []
    status: TemplateStatus = TemplateStatus.APPROVED
    
    class Config:
        populate_by_name = True


class TemplateCreate(BaseModel):
    """Template creation model"""
    name: str
    category: TemplateCategory
    content: str
    parameters: List[TemplateParameter] = []


class TemplateUpdate(BaseModel):
    """Template update model"""
    name: str = None
    category: TemplateCategory = None
    content: str = None
    parameters: List[TemplateParameter] = None


class TemplateInDB(Template):
    """Template model as stored in database"""
    pass


# Hardcoded templates for demo purposes
DEMO_TEMPLATES = [
    {
        "_id": "tmpl_diwali_offer",
        "name": "Diwali Offer",
        "category": "marketing",
        "content": "🎉 Happy Diwali {{1}}! Get {{2}}% OFF on all products. Use code: DIWALI2024. Valid till {{3}}. Shop now!",
        "parameters": [
            {"name": "customer_name", "example": "Rahul"},
            {"name": "discount", "example": "30"},
            {"name": "validity", "example": "31st Oct"}
        ],
        "status": "approved"
    },
    {
        "_id": "tmpl_payment_reminder",
        "name": "Payment Reminder",
        "category": "utility",
        "content": "Hi {{1}}, your payment of ₹{{2}} is due on {{3}}. Please pay to avoid late fees. Thank you!",
        "parameters": [
            {"name": "customer_name", "example": "Priya"},
            {"name": "amount", "example": "5000"},
            {"name": "due_date", "example": "25th Dec"}
        ],
        "status": "approved"
    },
    {
        "_id": "tmpl_order_confirmation",
        "name": "Order Confirmation",
        "category": "transactional",
        "content": "Thank you {{1}}! Your order #{{2}} has been confirmed. Estimated delivery: {{3}}. Track your order: {{4}}",
        "parameters": [
            {"name": "customer_name", "example": "Amit"},
            {"name": "order_id", "example": "ORD123456"},
            {"name": "delivery_date", "example": "20th Dec"},
            {"name": "tracking_link", "example": "track.example.com/123"}
        ],
        "status": "approved"
    },
    {
        "_id": "tmpl_appointment_reminder",
        "name": "Appointment Reminder",
        "category": "utility",
        "content": "Hello {{1}}! This is a reminder for your appointment on {{2}} at {{3}}. Location: {{4}}. See you soon!",
        "parameters": [
            {"name": "customer_name", "example": "Sneha"},
            {"name": "date", "example": "15th Dec"},
            {"name": "time", "example": "3:00 PM"},
            {"name": "location", "example": "Green Park Clinic"}
        ],
        "status": "approved"
    },
    {
        "_id": "tmpl_welcome_message",
        "name": "Welcome Message",
        "category": "marketing",
        "content": "Welcome to {{1}}, {{2}}! 🎊 We're excited to have you. Get {{3}}% OFF on your first purchase with code: WELCOME. Happy shopping!",
        "parameters": [
            {"name": "company_name", "example": "ShopHub"},
            {"name": "customer_name", "example": "Vikram"},
            {"name": "discount", "example": "20"}
        ],
        "status": "approved"
    }
]
