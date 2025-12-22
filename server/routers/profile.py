from fastapi import APIRouter, Depends, HTTPException, status
from database import get_database
from models.user import User
from services.auth_service import get_current_user
from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId

router = APIRouter(prefix="/profile", tags=["Profile"])


class ProfileUpdate(BaseModel):
    """Profile update model"""
    name: Optional[str] = None
    phone: Optional[str] = None
    business_name: Optional[str] = None
    business_address: Optional[str] = None
    website: Optional[str] = None
    business_hours: Optional[str] = None
    business_description: Optional[str] = None
    about: Optional[str] = None


class ProfileResponse(BaseModel):
    """Profile response model"""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    business_name: Optional[str] = None
    business_address: Optional[str] = None
    website: Optional[str] = None
    business_hours: Optional[str] = None
    business_description: Optional[str] = None
    about: Optional[str] = "Available"
    created_at: str


@router.get("/", response_model=ProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    
    db = get_database()
    
    # Get user with all profile fields
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return ProfileResponse(
        id=str(user["_id"]),
        name=user.get("name", ""),
        email=user.get("email", ""),
        phone=user.get("phone"),
        business_name=user.get("business_name"),
        business_address=user.get("business_address"),
        website=user.get("website"),
        business_hours=user.get("business_hours"),
        business_description=user.get("business_description"),
        about=user.get("about", "Available"),
        created_at=user.get("created_at", "").isoformat() if user.get("created_at") else ""
    )


@router.put("/", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile"""
    
    db = get_database()
    
    # Build update dict with only provided fields
    update_data = {k: v for k, v in profile_data.model_dump(exclude_unset=True).items()}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update user
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    
    return ProfileResponse(
        id=str(updated_user["_id"]),
        name=updated_user.get("name", ""),
        email=updated_user.get("email", ""),
        phone=updated_user.get("phone"),
        business_name=updated_user.get("business_name"),
        business_address=updated_user.get("business_address"),
        website=updated_user.get("website"),
        business_hours=updated_user.get("business_hours"),
        business_description=updated_user.get("business_description"),
        about=updated_user.get("about", "Available"),
        created_at=updated_user.get("created_at", "").isoformat() if updated_user.get("created_at") else ""
    )
