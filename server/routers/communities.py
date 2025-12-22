from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_database
from models.community import (
    Community, CommunityCreate, Group, GroupCreate,
    GroupMessage, GroupMessageCreate, CommunityWithGroups,
    CommunityMember, GroupMember
)
from models.user import User
from services.auth_service import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/communities", tags=["Communities"])


@router.post("/", response_model=Community, status_code=status.HTTP_201_CREATED)
async def create_community(
    community_data: CommunityCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new community with an announcement group"""
    
    db = get_database()
    
    # Create announcement group first
    announcement_group = {
        "name": f"{community_data.name} Announcements",
        "description": "Community announcements",
        "icon_url": community_data.icon_url,
        "creator_id": current_user.id,
        "members_count": 1,
        "created_at": datetime.utcnow()
    }
    
    announcement_result = await db.groups.insert_one(announcement_group)
    announcement_group_id = str(announcement_result.inserted_id)
    
    # Create community
    community_doc = {
        "name": community_data.name,
        "description": community_data.description,
        "icon_url": community_data.icon_url,
        "creator_id": current_user.id,
        "announcement_group_id": announcement_group_id,
        "members_count": 1,
        "created_at": datetime.utcnow()
    }
    
    result = await db.communities.insert_one(community_doc)
    community_id = str(result.inserted_id)
    
    # Update announcement group with community_id
    await db.groups.update_one(
        {"_id": ObjectId(announcement_group_id)},
        {"$set": {"community_id": community_id}}
    )
    
    # Add creator as admin member
    await db.community_members.insert_one({
        "community_id": community_id,
        "user_id": current_user.id,
        "role": "admin",
        "joined_at": datetime.utcnow()
    })
    
    await db.group_members.insert_one({
        "group_id": announcement_group_id,
        "user_id": current_user.id,
        "role": "admin",
        "joined_at": datetime.utcnow()
    })
    
    community_doc["_id"] = community_id
    return Community(**community_doc)


@router.get("/", response_model=List[CommunityWithGroups])
async def get_communities(
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get all communities with their groups"""
    
    db = get_database()
    
    # Get user's communities
    memberships = await db.community_members.find({"user_id": current_user.id}).to_list(length=None)
    community_ids = [ObjectId(m["community_id"]) for m in memberships]
    
    if not community_ids:
        return []
    
    # Get community details
    communities = await db.communities.find({"_id": {"$in": community_ids}}).limit(limit).to_list(length=limit)
    
    result = []
    for community in communities:
        community["_id"] = str(community["_id"])
        
        # Get groups in this community
        groups = await db.groups.find({"community_id": community["_id"]}).to_list(length=None)
        for group in groups:
            group["_id"] = str(group["_id"])
        
        # Check if user is admin
        member = next((m for m in memberships if m["community_id"] == community["_id"]), None)
        is_admin = member and member.get("role") == "admin"
        
        community_with_groups = CommunityWithGroups(
            **community,
            groups=[Group(**g) for g in groups],
            is_member=True,
            is_admin=is_admin
        )
        result.append(community_with_groups)
    
    return result


@router.get("/{community_id}", response_model=CommunityWithGroups)
async def get_community(
    community_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific community with its groups"""
    
    db = get_database()
    
    community = await db.communities.find_one({"_id": ObjectId(community_id)})
    
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    # Get groups in this community
    groups = await db.groups.find({"community_id": community_id}).to_list(length=None)
    for group in groups:
        group["_id"] = str(group["_id"])
    
    # Check membership
    member = await db.community_members.find_one({
        "community_id": community_id,
        "user_id": current_user.id
    })
    
    community["_id"] = str(community["_id"])
    return CommunityWithGroups(
        **community,
        groups=[Group(**g) for g in groups],
        is_member=member is not None,
        is_admin=member and member.get("role") == "admin"
    )


@router.post("/{community_id}/groups", response_model=Group, status_code=status.HTTP_201_CREATED)
async def create_group_in_community(
    community_id: str,
    group_data: GroupCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new group within a community"""
    
    db = get_database()
    
    # Verify community exists and user is member
    community = await db.communities.find_one({"_id": ObjectId(community_id)})
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    member = await db.community_members.find_one({
        "community_id": community_id,
        "user_id": current_user.id
    })
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of the community to create groups"
        )
    
    # Create group
    group_doc = {
        "name": group_data.name,
        "description": group_data.description,
        "icon_url": group_data.icon_url,
        "community_id": community_id,
        "creator_id": current_user.id,
        "members_count": 1,
        "created_at": datetime.utcnow()
    }
    
    result = await db.groups.insert_one(group_doc)
    group_id = str(result.inserted_id)
    
    # Add creator as admin member of the group
    await db.group_members.insert_one({
        "group_id": group_id,
        "user_id": current_user.id,
        "role": "admin",
        "joined_at": datetime.utcnow()
    })
    
    group_doc["_id"] = group_id
    return Group(**group_doc)


@router.post("/{community_id}/join", status_code=status.HTTP_201_CREATED)
async def join_community(
    community_id: str,
    current_user: User = Depends(get_current_user)
):
    """Join a community"""
    
    db = get_database()
    
    # Verify community exists
    community = await db.communities.find_one({"_id": ObjectId(community_id)})
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    # Check if already a member
    existing = await db.community_members.find_one({
        "community_id": community_id,
        "user_id": current_user.id
    })
    
    if existing:
        return {"message": "Already a member of this community"}
    
    # Add member
    await db.community_members.insert_one({
        "community_id": community_id,
        "user_id": current_user.id,
        "role": "member",
        "joined_at": datetime.utcnow()
    })
    
    # Increment members count
    await db.communities.update_one(
        {"_id": ObjectId(community_id)},
        {"$inc": {"members_count": 1}}
    )
    
    # Also join announcement group
    announcement_group_id = community["announcement_group_id"]
    await db.group_members.insert_one({
        "group_id": announcement_group_id,
        "user_id": current_user.id,
        "role": "member",
        "joined_at": datetime.utcnow()
    })
    
    await db.groups.update_one(
        {"_id": ObjectId(announcement_group_id)},
        {"$inc": {"members_count": 1}}
    )
    
    return {"message": "Successfully joined community"}


@router.post("/groups/{group_id}/join", status_code=status.HTTP_201_CREATED)
async def join_group(
    group_id: str,
    current_user: User = Depends(get_current_user)
):
    """Join a group within a community"""
    
    db = get_database()
    
    # Verify group exists
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Verify user is member of the community
    if group.get("community_id"):
        community_member = await db.community_members.find_one({
            "community_id": group["community_id"],
            "user_id": current_user.id
        })
        
        if not community_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be a member of the community to join this group"
            )
    
    # Check if already a member
    existing = await db.group_members.find_one({
        "group_id": group_id,
        "user_id": current_user.id
    })
    
    if existing:
        return {"message": "Already a member of this group"}
    
    # Add member
    await db.group_members.insert_one({
        "group_id": group_id,
        "user_id": current_user.id,
        "role": "member",
        "joined_at": datetime.utcnow()
    })
    
    # Increment members count
    await db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$inc": {"members_count": 1}}
    )
    
    return {"message": "Successfully joined group"}


@router.post("/groups/{group_id}/messages", response_model=GroupMessage, status_code=status.HTTP_201_CREATED)
async def send_group_message(
    group_id: str,
    message_data: GroupMessageCreate,
    current_user: User = Depends(get_current_user)
):
    """Send a message to a group"""
    
    db = get_database()
    
    # Verify group exists and user is member
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    member = await db.group_members.find_one({
        "group_id": group_id,
        "user_id": current_user.id
    })
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of this group to send messages"
        )
    
    # Create message
    message_doc = {
        "group_id": group_id,
        "user_id": current_user.id,
        "user_name": current_user.name,
        "content": message_data.content,
        "media_url": message_data.media_url,
        "created_at": datetime.utcnow()
    }
    
    result = await db.group_messages.insert_one(message_doc)
    message_doc["_id"] = str(result.inserted_id)
    
    return GroupMessage(**message_doc)


@router.get("/groups/{group_id}/messages", response_model=List[GroupMessage])
async def get_group_messages(
    group_id: str,
    current_user: User = Depends(get_current_user),
    limit: int = Query(100, le=500)
):
    """Get messages from a group"""
    
    db = get_database()
    
    # Verify group exists and user is member
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    member = await db.group_members.find_one({
        "group_id": group_id,
        "user_id": current_user.id
    })
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member of this group to view messages"
        )
    
    # Get messages
    cursor = db.group_messages.find({
        "group_id": group_id
    }).sort("created_at", -1).limit(limit)
    
    messages = await cursor.to_list(length=limit)
    
    # Format response
    for message in messages:
        message["_id"] = str(message["_id"])
    
    return [GroupMessage(**msg) for msg in reversed(messages)]
