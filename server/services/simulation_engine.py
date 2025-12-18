import asyncio
from database import get_database
from models.message import MessageStatus
from bson import ObjectId
from datetime import datetime
import logging
import random

logger = logging.getLogger(__name__)


async def simulate_campaign_delivery(campaign_id: str):
    """
    Simulate campaign message delivery with realistic delays
    
    This function gradually updates message statuses from sent -> delivered -> read
    over a period of time to create a realistic demo experience
    """
    
    db = get_database()
    
    try:
        # Get campaign
        campaign = await db.campaigns.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            logger.error(f"Campaign {campaign_id} not found")
            return
        
        message_ids = campaign.get("message_ids", [])
        total_messages = len(message_ids)
        
        if total_messages == 0:
            logger.warning(f"No messages in campaign {campaign_id}")
            return
        
        logger.info(f"Starting simulation for campaign {campaign_id} with {total_messages} messages")
        
        # Phase 1: Gradually mark messages as DELIVERED (over 10-30 seconds)
        delivered_count = 0
        for i, message_id in enumerate(message_ids):
            # Wait 0.5-2 seconds between each update
            await asyncio.sleep(random.uniform(0.5, 2))
            
            # Update message status to delivered
            await db.messages.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {"status": MessageStatus.DELIVERED}}
            )
            
            delivered_count += 1
            
            # Update campaign stats
            await db.campaigns.update_one(
                {"_id": ObjectId(campaign_id)},
                {"$set": {"delivered_count": delivered_count}}
            )
        
        logger.info(f"All messages marked as delivered for campaign {campaign_id}")
        
        # Wait a bit before starting to mark as read
        await asyncio.sleep(5)
        
        # Phase 2: Gradually mark some messages as READ (simulate realistic open rates)
        # Not all messages will be read - simulate ~60-70% read rate
        read_count = 0
        read_target = int(total_messages * random.uniform(0.6, 0.7))
        
        for i in range(read_target):
            # Wait 1-3 seconds between each update
            await asyncio.sleep(random.uniform(1, 3))
            
            # Pick a random message that's not already read
            message_id = message_ids[i]
            
            # Update message status to read
            await db.messages.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {"status": MessageStatus.READ}}
            )
            
            read_count += 1
            
            # Update campaign stats
            await db.campaigns.update_one(
                {"_id": ObjectId(campaign_id)},
                {"$set": {"read_count": read_count}}
            )
        
        # Mark campaign as completed
        await db.campaigns.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": {"status": "completed"}}
        )
        
        logger.info(f"Campaign {campaign_id} simulation completed. Delivered: {delivered_count}, Read: {read_count}")
        
    except Exception as e:
        logger.error(f"Error simulating campaign delivery: {e}")


async def simulate_single_message_status(message_id: str):
    """
    Simulate status updates for a single message
    sent -> delivered (after 10-15s) -> read (after another 15-20s)
    """
    
    db = get_database()
    
    try:
        # Wait 10-15 seconds then mark as delivered
        await asyncio.sleep(random.uniform(10, 15))
        
        result = await db.messages.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"status": MessageStatus.DELIVERED}}
        )
        
        if result.modified_count > 0:
            logger.debug(f"Message {message_id} marked as delivered")
        
        # Wait another 15-20 seconds then mark as read (simulate ~70% read rate)
        if random.random() < 0.7:
            await asyncio.sleep(random.uniform(15, 20))
            
            result = await db.messages.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {"status": MessageStatus.READ}}
            )
            
            if result.modified_count > 0:
                logger.debug(f"Message {message_id} marked as read")
        
    except Exception as e:
        logger.error(f"Error simulating message status: {e}")
