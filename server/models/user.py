from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    name: str


class UserCreate(UserBase):
    """User creation model"""
    password: str


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class UserInDB(UserBase):
    """User model as stored in database"""
    id: str = Field(alias="_id")
    password_hash: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class User(UserBase):
    """User response model (without password)"""
    id: str = Field(alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload model"""
    email: Optional[str] = None
    user_id: Optional[str] = None
