from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_database
from models.channel import (
    Channel, ChannelCreate, ChannelMessage, ChannelMessageCreate,
    ChannelWithFollowStatus, ChannelFollower
)
from models.user import User
from services.auth_service import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/channels", tags=["Channels"])


@router.post("/", response_model=Channel, status_code=status.HTTP_201_CREATED)
async def create_channel(
    channel_data: ChannelCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new broadcast channel"""
    
    db = get_database()
    
    # Check if user already has a channel with this name
    existing = await db.channels.find_one({
        "creator_id": current_user.id,
        "name": channel_data.name
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a channel with this name"
        )
    
    # Create channel
    channel_doc = {
        "name": channel_data.name,
        "description": channel_data.description,
        "avatar_url": channel_data.avatar_url,
        "creator_id": current_user.id,
        "followers_count": 0,
        "verified": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db.channels.insert_one(channel_doc)
    channel_doc["_id"] = str(result.inserted_id)
    
    return Channel(**channel_doc)


@router.get("/", response_model=List[ChannelWithFollowStatus])
async def get_channels(
    current_user: User = Depends(get_current_user),
    search: str = Query(None),
    limit: int = Query(50, le=100)
):
    """Get all channels (for discovery)"""
    
    db = get_database()
    
    # Build query
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    cursor = db.channels.find(query).sort("followers_count", -1).limit(limit)
    channels = await cursor.to_list(length=limit)
    
    # Get user's followed channels
    followed_channel_ids = set()
    followers = await db.channel_followers.find({"user_id": current_user.id}).to_list(length=None)
    followed_channel_ids = {f["channel_id"] for f in followers}
    
    # Format response
    result = []
    for channel in channels:
        channel["_id"] = str(channel["_id"])
        channel_with_status = ChannelWithFollowStatus(
            **channel,
            is_following=str(channel["_id"]) in followed_channel_ids,
            is_creator=channel["creator_id"] == current_user.id
        )
        result.append(channel_with_status)
    
    return result


@router.get("/following", response_model=List[ChannelWithFollowStatus])
async def get_following_channels(
    current_user: User = Depends(get_current_user)
):
    """Get channels the user is following"""
    
    db = get_database()
    
    # Get followed channel IDs
    followers = await db.channel_followers.find({"user_id": current_user.id}).to_list(length=None)
    channel_ids = [ObjectId(f["channel_id"]) for f in followers]
    
    if not channel_ids:
        return []
    
    # Get channel details
    channels = await db.channels.find({"_id": {"$in": channel_ids}}).to_list(length=len(channel_ids))
    
    result = []
    for channel in channels:
        channel["_id"] = str(channel["_id"])
        channel_with_status = ChannelWithFollowStatus(
            **channel,
            is_following=True,
            is_creator=channel["creator_id"] == current_user.id
        )
        result.append(channel_with_status)
    
    return result


@router.get("/{channel_id}", response_model=ChannelWithFollowStatus)
async def get_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific channel"""
    
    db = get_database()
    
    channel = await db.channels.find_one({"_id": ObjectId(channel_id)})
    
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found"
        )
    
    # Check if user follows this channel
    follower = await db.channel_followers.find_one({
        "channel_id": channel_id,
        "user_id": current_user.id
    })
    
    channel["_id"] = str(channel["_id"])
    return ChannelWithFollowStatus(
        **channel,
        is_following=follower is not None,
        is_creator=channel["creator_id"] == current_user.id
    )


@router.post("/{channel_id}/follow", status_code=status.HTTP_201_CREATED)
async def follow_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Follow a channel"""
    
    db = get_database()
    
    # Verify channel exists
    channel = await db.channels.find_one({"_id": ObjectId(channel_id)})
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found"
        )
    
    # Check if already following
    existing = await db.channel_followers.find_one({
        "channel_id": channel_id,
        "user_id": current_user.id
    })
    
    if existing:
        return {"message": "Already following this channel"}
    
    # Create follower relationship
    follower_doc = {
        "channel_id": channel_id,
        "user_id": current_user.id,
        "joined_at": datetime.utcnow()
    }
    
    await db.channel_followers.insert_one(follower_doc)
    
    # Increment followers count
    await db.channels.update_one(
        {"_id": ObjectId(channel_id)},
        {"$inc": {"followers_count": 1}}
    )
    
    return {"message": "Successfully followed channel"}


@router.delete("/{channel_id}/unfollow", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Unfollow a channel"""
    
    db = get_database()
    
    result = await db.channel_followers.delete_one({
        "channel_id": channel_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not following this channel"
        )
    
    # Decrement followers count
    await db.channels.update_one(
        {"_id": ObjectId(channel_id)},
        {"$inc": {"followers_count": -1}}
    )


@router.post("/{channel_id}/messages", response_model=ChannelMessage, status_code=status.HTTP_201_CREATED)
async def post_channel_message(
    channel_id: str,
    message_data: ChannelMessageCreate,
    current_user: User = Depends(get_current_user)
):
    """Post a message to a channel (creator only)"""
    
    db = get_database()
    
    # Verify channel exists and user is creator
    channel = await db.channels.find_one({"_id": ObjectId(channel_id)})
    
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found"
        )
    
    if channel["creator_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel creator can post messages"
        )
    
    # Create message
    message_doc = {
        "channel_id": channel_id,
        "content": message_data.content,
        "media_url": message_data.media_url,
        "created_at": datetime.utcnow()
    }
    
    result = await db.channel_messages.insert_one(message_doc)
    message_doc["_id"] = str(result.inserted_id)
    
    return ChannelMessage(**message_doc)


@router.get("/{channel_id}/messages", response_model=List[ChannelMessage])
async def get_channel_messages(
    channel_id: str,
    current_user: User = Depends(get_current_user),
    limit: int = Query(100, le=500)
):
    """Get messages from a channel"""
    
    db = get_database()
    
    # Verify channel exists
    channel = await db.channels.find_one({"_id": ObjectId(channel_id)})
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found"
        )
    
    # Get messages
    cursor = db.channel_messages.find({
        "channel_id": channel_id
    }).sort("created_at", -1).limit(limit)
    
    messages = await cursor.to_list(length=limit)
    
    # Format response
    for message in messages:
        message["_id"] = str(message["_id"])
    
    return [ChannelMessage(**msg) for msg in reversed(messages)]


@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a channel (creator only)"""
    
    db = get_database()
    
    # Verify channel exists and user is creator
    channel = await db.channels.find_one({"_id": ObjectId(channel_id)})
    
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found"
        )
    
    if channel["creator_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the channel creator can delete the channel"
        )
    
    # Delete channel, followers, and messages
    await db.channels.delete_one({"_id": ObjectId(channel_id)})
    await db.channel_followers.delete_many({"channel_id": channel_id})
    await db.channel_messages.delete_many({"channel_id": channel_id})
