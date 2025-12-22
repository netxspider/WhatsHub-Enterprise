from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_database
from models.message import (
    Message, ChatThread, SendMessageRequest, SendTemplateRequest,
    MessageDirection, MessageStatus, MessageType
)
from models.user import User
from services.auth_service import get_current_user
from datetime import datetime
from bson import ObjectId
from typing import List
import asyncio

router = APIRouter(prefix="/chat", tags=["Chat"])


async def get_or_create_thread(db, user_id: str, contact_id: str) -> str:
    """Get existing thread or create new one"""
    
    thread = await db.chat_threads.find_one({
        "user_id": user_id,
        "contact_id": contact_id
    })
    
    if thread:
        return str(thread["_id"])
    
    # Create new thread
    thread_doc = {
        "user_id": user_id,
        "contact_id": contact_id,
        "last_message": None,
        "unread_count": 0,
        "updated_at": datetime.utcnow()
    }
    
    result = await db.chat_threads.insert_one(thread_doc)
    return str(result.inserted_id)


@router.get("/threads", response_model=List[ChatThread])
async def get_chat_threads(
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, le=100)
):
    """Get all chat threads for the current user"""
    
    db = get_database()
    
    # Removed user_id filter for demo (all users see all chats)
    cursor = db.chat_threads.find({}).sort("updated_at", -1).limit(limit)
    
    threads = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string and enrich with contact info
    result = []
    for thread in threads:
        thread["_id"] = str(thread["_id"])
        
        # Skip threads with invalid contact_id
        contact_id = thread.get("contact_id")
        if not contact_id or contact_id == "undefined":
            continue
        
        # Enrich with contact name and phone
        try:
            contact = await db.contacts.find_one({"_id": ObjectId(contact_id)})
            if contact:
                thread["contact_name"] = contact.get("name", "Unknown")
                thread["contact_phone"] = contact.get("phone", "")
            else:
                thread["contact_name"] = "Unknown Contact"
                thread["contact_phone"] = ""
        except Exception as e:
            # Handle invalid ObjectId or other errors
            thread["contact_name"] = "Unknown Contact"
            thread["contact_phone"] = ""
        
        result.append(ChatThread(**thread))
    
    return result


@router.get("/threads/{contact_id}/messages", response_model=List[Message])
async def get_thread_messages(
    contact_id: str,
    current_user: User = Depends(get_current_user),
    limit: int = Query(100, le=500)
):
    """Get all messages in a chat thread"""
    
    db = get_database()
    
    # Get or create thread
    thread_id = await get_or_create_thread(db, current_user.id, contact_id)
    
    # Get messages
    cursor = db.messages.find({
        "thread_id": thread_id
    }).sort("timestamp", 1).limit(limit)
    
    messages = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for message in messages:
        message["_id"] = str(message["_id"])
    
    return [Message(**message) for message in messages]


@router.post("/send", response_model=Message)
async def send_message(
    message_data: SendMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a message to a contact"""
    
    db = get_database()
    
    # Verify contact exists and belongs to user
    contact = await db.contacts.find_one({
        "_id": ObjectId(message_data.contact_id),
        "user_id": current_user.id
    })
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Get or create thread
    thread_id = await get_or_create_thread(db, current_user.id, message_data.contact_id)
    
    # Create message
    message_doc = {
        "thread_id": thread_id,
        "direction": MessageDirection.OUTBOUND,
        "content": message_data.content,
        "type": message_data.type,
        "status": MessageStatus.SENT,
        "timestamp": datetime.utcnow()
    }
    
    result = await db.messages.insert_one(message_doc)
    message_doc["_id"] = str(result.inserted_id)
    
    # Update thread
    await db.chat_threads.update_one(
        {"_id": ObjectId(thread_id)},
        {
            "$set": {
                "last_message": message_data.content,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Trigger auto-bot reply in background
    asyncio.create_task(trigger_auto_reply(db, thread_id, message_data.content))
    
    # Trigger status update in background
    asyncio.create_task(update_message_status(db, str(result.inserted_id)))
    
    return Message(**message_doc)


@router.post("/send-template", response_model=Message)
async def send_template_message(
    template_data: SendTemplateRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a template message to a contact"""
    
    db = get_database()
    
    # Get template
    from models.template import DEMO_TEMPLATES
    template = next((t for t in DEMO_TEMPLATES if t["_id"] == template_data.template_id), None)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Fill template parameters
    content = template["content"]
    for i, (key, value) in enumerate(template_data.parameters.items(), start=1):
        content = content.replace(f"{{{{{i}}}}}", str(value))
    
    # Send as regular message
    message_request = SendMessageRequest(
        contact_id=template_data.contact_id,
        content=content,
        type=MessageType.TEMPLATE
    )
    
    return await send_message(message_request, current_user)


async def trigger_auto_reply(db, thread_id: str, user_message: str):
    """Trigger automated reply based on keywords"""
    
    # Wait 3 seconds before replying
    await asyncio.sleep(3)
    
    # Check for keywords and generate reply
    user_message_lower = user_message.lower()
    reply = None
    
    if any(word in user_message_lower for word in ["hello", "hi", "hey"]):
        reply = "Hello! How can I help you today? 😊"
    elif any(word in user_message_lower for word in ["price", "cost", "pricing"]):
        reply = "Our pricing starts at ₹999/month. Would you like a detailed quote?"
    elif "help" in user_message_lower:
        reply = "I'm here to help! What do you need assistance with?"
    elif any(word in user_message_lower for word in ["thanks", "thank you"]):
        reply = "You're welcome! Let me know if you need anything else."
    elif "?" in user_message:
        reply = "That's a great question! Let me get back to you with details."
    
    if reply:
        # Create inbound message
        message_doc = {
            "thread_id": thread_id,
            "direction": MessageDirection.INBOUND,
            "content": reply,
            "type": MessageType.TEXT,
            "status": MessageStatus.DELIVERED,
            "timestamp": datetime.utcnow()
        }
        
        await db.messages.insert_one(message_doc)
        
        # Update thread
        await db.chat_threads.update_one(
            {"_id": ObjectId(thread_id)},
            {
                "$set": {
                    "last_message": reply,
                    "updated_at": datetime.utcnow()
                },
                "$inc": {"unread_count": 1}
            }
        )


async def update_message_status(db, message_id: str):
    """Update message status with realistic delays"""
    
    # Wait 10-15 seconds then mark as delivered
    await asyncio.sleep(12)
    await db.messages.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"status": MessageStatus.DELIVERED}}
    )
    
    # Wait another 15-20 seconds then mark as read
    await asyncio.sleep(17)
    await db.messages.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"status": MessageStatus.READ}}
    )
