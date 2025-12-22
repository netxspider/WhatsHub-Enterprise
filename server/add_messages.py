"""
Add channel and community messages to existing seeded data
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import connect_to_mongo, get_database, close_mongo_connection

async def add_messages():
    await connect_to_mongo()
    db = get_database()
    
    print("Adding channel messages...")
    
    # Get all channels
    channels = await db.channels.find({}).to_list(length=10)
    
    channel_messages = [
        "🎉 Exciting news! We're launching our new product line next week!",
        "📊 Check out the latest market trends in our industry report.",
        "💡 Pro tip: Use these strategies to boost your conversion rate by 30%.",
        "🚀 Big announcement coming tomorrow. Stay tuned!",
        "📢 Don't miss our webinar on digital marketing this Friday!",
    ]
    
    for channel in channels:
        channel_id = str(channel["_id"])
        creator_id = channel.get("creator_id")
        
        for msg_content in random.sample(channel_messages, 3):
            channel_msg = {
                "channel_id": channel_id,
                "user_id": creator_id,
                "content": msg_content,
                "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
            }
            await db.channel_messages.insert_one(channel_msg)
    
    print(f"✅ Added messages to {len(channels)} channels")
    
    # Get all groups
    print("Adding community group messages...")
    groups = await db.groups.find({}).to_list(length=20)
    
    # Get all users
    users = await db.users.find({}).to_list(length=10)
    user_ids = [str(u["_id"]) for u in users]
    user_names = [u.get("name", "User") for u in users]
    
    group_messages = [
        "Hey everyone! Welcome to the group.",
        "Does anyone have experience with this topic?",
        "Thanks for sharing that resource!",
        "Great discussion today. Let's continue tomorrow.",
        "I found this article really helpful...",
        "Has anyone tried the new update yet?",
        "Looking forward to our next meetup!",
        "Quick question about the project...",
    ]
    
    for group in groups:
        group_id = str(group["_id"])
        
        # Add 4-7 messages per group
        for msg_content in random.sample(group_messages, random.randint(4, 7)):
            group_msg = {
                "group_id": group_id,
                "user_id": random.choice(user_ids),
                "user_name": random.choice(user_names),
                "content": msg_content,
                "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 5), hours=random.randint(0, 23))
            }
            await db.group_messages.insert_one(group_msg)
    
    print(f"✅ Added messages to {len(groups)} groups")
    
    await close_mongo_connection()
    print("✅ Done!")

if __name__ == "__main__":
    asyncio.run(add_messages())
