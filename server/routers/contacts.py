from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_database
from models.contact import Contact, ContactCreate, ContactUpdate, ContactImportRequest, ContactImportResponse
from models.user import User
from services.auth_service import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List, Optional

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.post("/", response_model=Contact, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new contact"""
    
    db = get_database()
    
    # Check if contact with same phone already exists for this user
    existing = await db.contacts.find_one({
        "user_id": current_user.id,
        "phone": contact_data.phone
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact with this phone number already exists"
        )
    
    # Create contact document
    contact_doc = {
        **contact_data.model_dump(),
        "user_id": current_user.id,
        "created_at": datetime.utcnow()
    }
    
    result = await db.contacts.insert_one(contact_doc)
    contact_doc["_id"] = str(result.inserted_id)
    
    return Contact(**contact_doc)


@router.get("/", response_model=List[Contact])
async def get_contacts(
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    limit: int = Query(100, le=500)
):
    """Get all contacts for the current user"""
    
    db = get_database()
    
    # Build query
    query = {"user_id": current_user.id}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    # Get contacts
    cursor = db.contacts.find(query).limit(limit).sort("created_at", -1)
    contacts = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for contact in contacts:
        contact["_id"] = str(contact["_id"])
    
    return [Contact(**contact) for contact in contacts]


@router.get("/{contact_id}", response_model=Contact)
async def get_contact(
    contact_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific contact"""
    
    db = get_database()
    
    contact = await db.contacts.find_one({
        "_id": ObjectId(contact_id),
        "user_id": current_user.id
    })
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    contact["_id"] = str(contact["_id"])
    return Contact(**contact)


@router.put("/{contact_id}", response_model=Contact)
async def update_contact(
    contact_id: str,
    contact_data: ContactUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a contact"""
    
    db = get_database()
    
    # Check if contact exists
    contact = await db.contacts.find_one({
        "_id": ObjectId(contact_id),
        "user_id": current_user.id
    })
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Update contact
    update_data = {k: v for k, v in contact_data.model_dump(exclude_unset=True).items()}
    
    if update_data:
        await db.contacts.update_one(
            {"_id": ObjectId(contact_id)},
            {"$set": update_data}
        )
    
    # Get updated contact
    updated_contact = await db.contacts.find_one({"_id": ObjectId(contact_id)})
    updated_contact["_id"] = str(updated_contact["_id"])
    
    return Contact(**updated_contact)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a contact"""
    
    db = get_database()
    
    result = await db.contacts.delete_one({
        "_id": ObjectId(contact_id),
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )


@router.get("/tags/all", response_model=List[str])
async def get_all_tags(current_user: User = Depends(get_current_user)):
    """Get all unique tags used by the current user"""
    
    db = get_database()
    
    # Aggregate to get all unique tags
    pipeline = [
        {"$match": {"user_id": current_user.id}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags"}},
        {"$sort": {"_id": 1}}
    ]
    
    result = await db.contacts.aggregate(pipeline).to_list(length=None)
    tags = [doc["_id"] for doc in result if doc["_id"]]
    
    return tags
