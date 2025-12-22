from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_database
from models.contact import (
    Contact, ContactCreate, ContactUpdate, 
    ContactRelationship, ContactRelationshipInDB,
    AddContactRequest, ContactSearchResponse
)
from models.user import User
from services.auth_service import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.post("/add", response_model=ContactRelationshipInDB, status_code=status.HTTP_201_CREATED)
async def add_contact(
    request: AddContactRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Add a new contact with bidirectional relationship.
    Requires either email or phone to find the user.
    """
    db = get_database()
    
    # 1. Find the user to add
    query = {}
    if request.email:
        query["email"] = request.email
    elif request.phone:
        # Simple phone matching - in production would need normalization
        query["phone"] = request.phone
        
    target_user = await db.users.find_one(query)
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Contacts must be registered users."
        )
        
    if str(target_user["_id"]) == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot add yourself as a contact"
        )
        
    target_user_id = str(target_user["_id"])
    
    # 2. Check if relationship already exists
    existing = await db.contact_relationships.find_one({
        "user_id": current_user.id,
        "contact_user_id": target_user_id
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact already exists"
        )
        
    # 3. Create bidirectional relationships
    
    # Relationship A -> B
    rel_a_to_b = {
        "user_id": current_user.id,
        "contact_user_id": target_user_id,
        "contact_name": request.name or target_user.get("name", "Unknown"),
        "contact_phone": target_user.get("phone", ""),  # Assuming phone is on user object or separate lookup
        "contact_email": target_user.get("email"),
        "is_blocked": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Relationship B -> A
    rel_b_to_a = {
        "user_id": target_user_id,
        "contact_user_id": current_user.id,
        "contact_name": current_user.name,
        "contact_phone": current_user.phone if hasattr(current_user, 'phone') else "",
        "contact_email": current_user.email,
        "is_blocked": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert both
    result = await db.contact_relationships.insert_one(rel_a_to_b)
    await db.contact_relationships.insert_one(rel_b_to_a)
    
    # Return the created relationship for current user
    rel_a_to_b["_id"] = str(result.inserted_id)
    return ContactRelationshipInDB(**rel_a_to_b)


@router.post("/{contact_id}/block", status_code=status.HTTP_200_OK)
async def block_contact(
    contact_id: str,
    current_user: User = Depends(get_current_user)
):
    """Block a contact"""
    db = get_database()
    
    # Verify relationship exists
    rel = await db.contact_relationships.find_one({
        "_id": ObjectId(contact_id),
        "user_id": current_user.id
    })
    
    if not rel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
        
    # Update block status
    await db.contact_relationships.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": {"is_blocked": True, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Contact blocked successfully"}


@router.post("/{contact_id}/unblock", status_code=status.HTTP_200_OK)
async def unblock_contact(
    contact_id: str,
    current_user: User = Depends(get_current_user)
):
    """Unblock a contact"""
    db = get_database()
    
    result = await db.contact_relationships.update_one(
        {"_id": ObjectId(contact_id), "user_id": current_user.id},
        {"$set": {"is_blocked": False, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
        
    return {"message": "Contact unblocked successfully"}


@router.get("/search", response_model=ContactSearchResponse)
async def search_contacts(
    query: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user)
):
    """Search my contacts by name, email or phone"""
    db = get_database()
    
    # Search in user's contacts
    search_filter = {
        "user_id": current_user.id,
        "$or": [
            {"contact_name": {"$regex": query, "$options": "i"}},
            {"contact_email": {"$regex": query, "$options": "i"}},
            {"contact_phone": {"$regex": query, "$options": "i"}}
        ]
    }
    
    cursor = db.contact_relationships.find(search_filter).limit(50)
    contacts = await cursor.to_list(length=50)
    
    return ContactSearchResponse(
        contacts=[ContactRelationshipInDB(**c) for c in contacts],
        total=len(contacts)
    )


@router.get("/", response_model=List[ContactRelationshipInDB])
async def get_contacts(
    current_user: User = Depends(get_current_user),
    skip_blocked: bool = Query(False)
):
    """Get all contacts for current user"""
    db = get_database()
    
    query = {"user_id": current_user.id}
    if skip_blocked:
        query["is_blocked"] = False
        
    cursor = db.contact_relationships.find(query).sort("contact_name", 1)
    contacts = await cursor.to_list(length=1000)
    
    return [ContactRelationshipInDB(**c) for c in contacts]

# --- Compatibility Endpoints (Deprecated/Transition) ---

@router.post("/", response_model=Contact)
async def create_contact_legacy(
    contact_data: ContactCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Legacy endpoint for creating contact. 
    Redirects logic to add_contact if user exists, otherwise falls back to basic contact.
    """
    # Simply call the new logic if possible, or maintain old behavior for non-registered users
    # For this implementation, we'll maintain the old behavior for "manual" contacts
    # but strictly speaking, the requirement is for bidirectional.
    
    # We will simulate the old behavior but store separately if needed or just use the old collection
    # The Implementation Plan suggested "Update to use contact_relationships collection"
    # But we might still have 'manual' contacts that are not registered users?
    # The requirement says "Add contact endpoint to create relationships for both users"
    # If the contact is NOT a user, we can't create a bidirectional relationship.
    # So we might need to keep the old collection for "Manual/Unregistered" contacts??
    # Or enforce that contacts must be users.
    # "Check if user is registered" was part of the plan.
    
    # Keeping old logic for backward compatibility with frontend if it hasn't changed yet
    db = get_database()
    
    # Check if contact with same phone already exists for this user in old collection
    existing = await db.contacts.find_one({
        "user_id": current_user.id,
        "phone": contact_data.phone
    })
    
    if existing:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact with this phone number already exists"
        )

    contact_doc = {
        **contact_data.model_dump(),
        "user_id": current_user.id,
        "created_at": datetime.utcnow()
    }
    
    result = await db.contacts.insert_one(contact_doc)
    contact_doc["_id"] = str(result.inserted_id)
    return Contact(**contact_doc)
