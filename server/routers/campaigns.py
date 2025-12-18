from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_database
from models.campaign import (
    Campaign, CampaignCreate, CampaignStats, CampaignContact,
    CampaignStatus
)
from models.contact import ContactSource
from models.message import MessageDirection, MessageStatus, MessageType
from models.user import User
from services.auth_service import get_current_user
from services.sheet_service import sheets_service
from services.simulation_engine import simulate_campaign_delivery
from datetime import datetime
from bson import ObjectId
from typing import List
import asyncio

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("/", response_model=Campaign, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new campaign by importing contacts from Google Sheets
    and sending messages to them
    """
    
    db = get_database()
    
    try:
        # Fetch contacts from Google Sheet
        sheet_data = sheets_service.get_sheet_data(
            campaign_data.sheet_url,
            campaign_data.sheet_name
        )
        
        if not sheet_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data found in the Google Sheet"
            )
        
        # Create contacts and messages
        contact_ids = []
        message_ids = []
        
        for row in sheet_data:
            # Extract name and phone (handle different column names)
            name = row.get('Name') or row.get('name') or row.get('Customer Name') or 'Unknown'
            phone = row.get('Phone') or row.get('phone') or row.get('Mobile') or row.get('Number')
            
            if not phone:
                continue  # Skip rows without phone number
            
            # Check if contact already exists
            existing_contact = await db.contacts.find_one({
                "user_id": current_user.id,
                "phone": phone
            })
            
            if existing_contact:
                contact_id = str(existing_contact["_id"])
            else:
                # Create new contact
                contact_doc = {
                    "user_id": current_user.id,
                    "name": name,
                    "phone": phone,
                    "tags": ["campaign", campaign_data.name],
                    "source": ContactSource.SHEET,
                    "created_at": datetime.utcnow()
                }
                
                result = await db.contacts.insert_one(contact_doc)
                contact_id = str(result.inserted_id)
            
            contact_ids.append(contact_id)
            
            # Get or create chat thread
            thread = await db.chat_threads.find_one({
                "user_id": current_user.id,
                "contact_id": contact_id
            })
            
            if not thread:
                thread_doc = {
                    "user_id": current_user.id,
                    "contact_id": contact_id,
                    "last_message": None,
                    "unread_count": 0,
                    "updated_at": datetime.utcnow()
                }
                thread_result = await db.chat_threads.insert_one(thread_doc)
                thread_id = str(thread_result.inserted_id)
            else:
                thread_id = str(thread["_id"])
            
            # Prepare message content
            if campaign_data.template_id:
                # Get template and fill parameters
                from models.template import DEMO_TEMPLATES
                template = next((t for t in DEMO_TEMPLATES if t["_id"] == campaign_data.template_id), None)
                
                if template:
                    content = template["content"]
                    # Replace parameters
                    content = content.replace("{{1}}", name)
                    for i, (key, value) in enumerate(campaign_data.template_parameters.items(), start=2):
                        content = content.replace(f"{{{{{i}}}}}", str(value))
                else:
                    content = f"Hello {name}! This is a message from {campaign_data.name} campaign."
            else:
                content = f"Hello {name}! This is a message from {campaign_data.name} campaign."
            
            # Create outbound message
            message_doc = {
                "thread_id": thread_id,
                "direction": MessageDirection.OUTBOUND,
                "content": content,
                "type": MessageType.TEMPLATE if campaign_data.template_id else MessageType.TEXT,
                "status": MessageStatus.SENT,
                "timestamp": datetime.utcnow()
            }
            
            message_result = await db.messages.insert_one(message_doc)
            message_ids.append(str(message_result.inserted_id))
            
            # Update thread
            await db.chat_threads.update_one(
                {"_id": ObjectId(thread_id)},
                {"$set": {"last_message": content, "updated_at": datetime.utcnow()}}
            )
        
        # Create campaign document
        campaign_doc = {
            "user_id": current_user.id,
            "name": campaign_data.name,
            "template_id": campaign_data.template_id,
            "status": CampaignStatus.ACTIVE,
            "total_contacts": len(contact_ids),
            "delivered_count": 0,
            "read_count": 0,
            "contact_ids": contact_ids,
            "message_ids": message_ids,
            "created_at": datetime.utcnow()
        }
        
        result = await db.campaigns.insert_one(campaign_doc)
        campaign_id = str(result.inserted_id)
        campaign_doc["_id"] = campaign_id
        
        # Trigger simulation in background
        asyncio.create_task(simulate_campaign_delivery(campaign_id))
        
        return Campaign(**{k: v for k, v in campaign_doc.items() if k not in ["contact_ids", "message_ids"]})
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create campaign: {str(e)}"
        )


@router.get("/", response_model=List[Campaign])
async def get_campaigns(
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get all campaigns for the current user"""
    
    db = get_database()
    
    cursor = db.campaigns.find({
        "user_id": current_user.id
    }).sort("created_at", -1).limit(limit)
    
    campaigns = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    result = []
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
        result.append(Campaign(**{k: v for k, v in campaign.items() if k not in ["contact_ids", "message_ids"]}))
    
    return result


@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific campaign"""
    
    db = get_database()
    
    campaign = await db.campaigns.find_one({
        "_id": ObjectId(campaign_id),
        "user_id": current_user.id
    })
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    campaign["_id"] = str(campaign["_id"])
    return Campaign(**{k: v for k, v in campaign.items() if k not in ["contact_ids", "message_ids"]})


@router.get("/{campaign_id}/stats", response_model=CampaignStats)
async def get_campaign_stats(
    campaign_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get campaign statistics"""
    
    db = get_database()
    
    campaign = await db.campaigns.find_one({
        "_id": ObjectId(campaign_id),
        "user_id": current_user.id
    })
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Count messages by status
    message_ids = campaign.get("message_ids", [])
    
    sent_count = await db.messages.count_documents({
        "_id": {"$in": [ObjectId(mid) for mid in message_ids]},
        "status": MessageStatus.SENT
    })
    
    delivered_count = await db.messages.count_documents({
        "_id": {"$in": [ObjectId(mid) for mid in message_ids]},
        "status": {"$in": [MessageStatus.DELIVERED, MessageStatus.READ]}
    })
    
    read_count = await db.messages.count_documents({
        "_id": {"$in": [ObjectId(mid) for mid in message_ids]},
        "status": MessageStatus.READ
    })
    
    failed_count = await db.messages.count_documents({
        "_id": {"$in": [ObjectId(mid) for mid in message_ids]},
        "status": MessageStatus.FAILED
    })
    
    return CampaignStats(
        campaign_id=campaign_id,
        total_contacts=campaign["total_contacts"],
        sent_count=len(message_ids),
        delivered_count=delivered_count,
        read_count=read_count,
        failed_count=failed_count
    )


@router.get("/{campaign_id}/contacts", response_model=List[CampaignContact])
async def get_campaign_contacts(
    campaign_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all contacts in a campaign with their message status"""
    
    db = get_database()
    
    campaign = await db.campaigns.find_one({
        "_id": ObjectId(campaign_id),
        "user_id": current_user.id
    })
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    contact_ids = campaign.get("contact_ids", [])
    message_ids = campaign.get("message_ids", [])
    
    # Get contacts
    contacts = await db.contacts.find({
        "_id": {"$in": [ObjectId(cid) for cid in contact_ids]}
    }).to_list(length=len(contact_ids))
    
    # Get messages
    messages = await db.messages.find({
        "_id": {"$in": [ObjectId(mid) for mid in message_ids]}
    }).to_list(length=len(message_ids))
    
    # Map messages to contacts
    message_by_thread = {str(msg["thread_id"]): msg for msg in messages}
    
    result = []
    for contact in contacts:
        # Find thread for this contact
        thread = await db.chat_threads.find_one({
            "user_id": current_user.id,
            "contact_id": str(contact["_id"])
        })
        
        if thread:
            thread_id = str(thread["_id"])
            message = message_by_thread.get(thread_id)
            
            if message:
                result.append(CampaignContact(
                    contact_id=str(contact["_id"]),
                    name=contact["name"],
                    phone=contact["phone"],
                    message_status=message["status"],
                    sent_at=message["timestamp"]
                ))
    
    return result
