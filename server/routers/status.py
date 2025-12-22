from fastapi import APIRouter, Depends, HTTPException, status, Query
from database import get_database
from models.user import User
from services.auth_service import get_current_user
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter(prefix="/status", tags=["Status"])


class StatusCreate(BaseModel):
    """Status creation model"""
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = "text"  # "text", "image", "video"


class StatusUpdate(BaseModel):
    """Status update model"""
    id: str
    user_id: str
    contact_name: str
    contact_phone: str
    content: str
    media_url: Optional[str] = None
    media_type: str = "text"
    created_at: str
    expires_at: str
    viewed: bool = False
    views_count: int = 0


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_status(
    status_data: StatusCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new status update"""
    
    db = get_database()
    
    # Get user info
    user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    
    # Create status document
    status_doc = {
        "user_id": current_user.id,
        "contact_name": user.get("name", ""),
        "contact_phone": user.get("phone", ""),
        "content": status_data.content,
        "media_url": status_data.media_url,
        "media_type": status_data.media_type,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=24),
        "viewed": False,
        "views_count": 0,
        "viewers": []  # List of user IDs who viewed
    }
    
    result = await db.status_updates.insert_one(status_doc)
    status_doc["_id"] = str(result.inserted_id)
    
    return {
        "id": str(result.inserted_id),
        "message": "Status created successfully",
        "expires_in_hours": 24
    }


@router.get("/", response_model=List[StatusUpdate])
async def get_statuses(
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get all active status updates (not expired)"""
    
    db = get_database()
    
    # Get all non-expired statuses
    now = datetime.utcnow()
    
    statuses = await db.status_updates.find({
        "expires_at": {"$gt": now}
    }).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    # Format response
    result = []
    for status in statuses:
        result.append(StatusUpdate(
            id=str(status["_id"]),
            user_id=status.get("user_id", ""),
            contact_name=status.get("contact_name", ""),
            contact_phone=status.get("contact_phone", ""),
            content=status.get("content", ""),
            media_url=status.get("media_url"),
            media_type=status.get("media_type", "text"),
            created_at=status.get("created_at", datetime.utcnow()).isoformat(),
            expires_at=status.get("expires_at", datetime.utcnow()).isoformat(),
            viewed=current_user.id in status.get("viewers", []),
            views_count=len(status.get("viewers", []))
        ))
    
    return result


@router.get("/{status_id}")
async def get_status(
    status_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific status and mark as viewed"""
    
    db = get_database()
    
    # Get status
    status = await db.status_updates.find_one({"_id": ObjectId(status_id)})
    
    if not status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status not found"
        )
    
    # Check if expired
    if status.get("expires_at", datetime.utcnow()) < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Status has expired"
        )
    
    # Mark as viewed by current user
    if current_user.id not in status.get("viewers", []):
        await db.status_updates.update_one(
            {"_id": ObjectId(status_id)},
            {"$addToSet": {"viewers": current_user.id}}
        )
    
    # Get updated status
    updated_status = await db.status_updates.find_one({"_id": ObjectId(status_id)})
    
    return StatusUpdate(
        id=str(updated_status["_id"]),
        user_id=updated_status.get("user_id", ""),
        contact_name=updated_status.get("contact_name", ""),
        contact_phone=updated_status.get("contact_phone", ""),
        content=updated_status.get("content", ""),
        media_url=updated_status.get("media_url"),
        media_type=updated_status.get("media_type", "text"),
        created_at=updated_status.get("created_at", datetime.utcnow()).isoformat(),
        expires_at=updated_status.get("expires_at", datetime.utcnow()).isoformat(),
        viewed=True,
        views_count=len(updated_status.get("viewers", []))
    )


@router.delete("/{status_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_status(
    status_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a status update (only owner can delete)"""
    
    db = get_database()
    
    result = await db.status_updates.delete_one({
        "_id": ObjectId(status_id),
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status not found or you don't have permission"
        )
