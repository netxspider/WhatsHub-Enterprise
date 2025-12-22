from fastapi import APIRouter, Depends, HTTPException, status
from database import get_database
from models.user import User
from services.auth_service import get_current_user
from pydantic import BaseModel
from typing import Optional, Dict, Any
from bson import ObjectId

router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingsUpdate(BaseModel):
    """Settings update model"""
    theme: Optional[str] = None  # "light", "dark", "system"
    notifications_enabled: Optional[bool] = None
    notification_sound: Optional[bool] = None
    notification_preview: Optional[bool] = None
    enter_is_send: Optional[bool] = None
    media_visibility: Optional[bool] = None
    font_size: Optional[str] = None  # "small", "medium", "large"
    last_seen_visibility: Optional[str] = None  # "everyone", "contacts", "nobody"
    profile_photo_visibility: Optional[str] = None  # "everyone", "contacts", "nobody"
    about_visibility: Optional[str] = None  # "everyone", "contacts", "nobody"


class SettingsResponse(BaseModel):
    """Settings response model"""
    theme: str = "light"
    notifications_enabled: bool = True
    notification_sound: bool = True
    notification_preview: bool = True
    enter_is_send: bool = False
    media_visibility: bool = True
    font_size: str = "medium"
    last_seen_visibility: str = "everyone"
    profile_photo_visibility: str = "everyone"
    about_visibility: str = "everyone"


@router.get("/", response_model=SettingsResponse)
async def get_settings(current_user: User = Depends(get_current_user)):
    """Get current user's settings"""
    
    db = get_database()
    
    # Get user settings
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get settings with defaults
    settings = user.get("settings", {})
    
    return SettingsResponse(
        theme=settings.get("theme", "light"),
        notifications_enabled=settings.get("notifications_enabled", True),
        notification_sound=settings.get("notification_sound", True),
        notification_preview=settings.get("notification_preview", True),
        enter_is_send=settings.get("enter_is_send", False),
        media_visibility=settings.get("media_visibility", True),
        font_size=settings.get("font_size", "medium"),
        last_seen_visibility=settings.get("last_seen_visibility", "everyone"),
        profile_photo_visibility=settings.get("profile_photo_visibility", "everyone"),
        about_visibility=settings.get("about_visibility", "everyone")
    )


@router.put("/", response_model=SettingsResponse)
async def update_settings(
    settings_data: SettingsUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user's settings"""
    
    db = get_database()
    
    # Build update dict with only provided fields
    update_fields = {k: v for k, v in settings_data.model_dump(exclude_unset=True).items()}
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No settings to update"
        )
    
    # Get current settings
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    current_settings = user.get("settings", {})
    
    # Merge with new settings
    updated_settings = {**current_settings, **update_fields}
    
    # Update user settings
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"settings": updated_settings}}
    )
    
    return SettingsResponse(**updated_settings)
