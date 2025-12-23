from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings
import logging

logger = logging.getLogger(__name__)

# Global MongoDB client and database instances
mongodb_client: AsyncIOMotorClient = None
mongodb: AsyncIOMotorDatabase = None


async def get_database() -> AsyncIOMotorDatabase:
    """Get database connection, creating it if necessary (serverless-friendly)"""
    global mongodb_client, mongodb
    
    if mongodb is None:
        try:
            logger.info(f"Connecting to MongoDB at {settings.mongodb_url}")
            # Initialize client with connection pooling optimized for serverless
            mongodb_client = AsyncIOMotorClient(
                settings.mongodb_url,
                maxPoolSize=10,  # Lower for serverless
                minPoolSize=1,   # Minimal pool for serverless
                maxIdleTimeMS=10000,  # Shorter idle time for serverless
                serverSelectionTimeoutMS=5000  # Faster timeout
            )
            mongodb = mongodb_client[settings.database_name]
            
            # Test connection
            await mongodb_client.admin.command('ping')
            logger.info(f"Successfully connected to MongoDB database: {settings.database_name}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    return mongodb


async def connect_to_mongo():
    """Connect to MongoDB and initialize database"""
    global mongodb
    mongodb = await get_database()
    # Create indexes
    await create_indexes()


async def close_mongo_connection():
    """Close MongoDB connection"""
    global mongodb_client
    
    if mongodb_client:
        mongodb_client.close()
        logger.info("Closed MongoDB connection")


async def create_indexes():
    """Create database indexes for better query performance"""
    try:
        # Users collection
        await mongodb.users.create_index("email", unique=True)
        await mongodb.users.create_index("created_at")
        
        # Contacts collection
        await mongodb.contacts.create_index([("user_id", 1), ("phone", 1)])
        await mongodb.contacts.create_index("user_id")
        await mongodb.contacts.create_index("email")
        
        # Contact relationships collection (bidirectional contacts)
        await mongodb.contact_relationships.create_index([("user_id", 1), ("contact_user_id", 1)], unique=True)
        await mongodb.contact_relationships.create_index("user_id")
        await mongodb.contact_relationships.create_index("contact_user_id")
        await mongodb.contact_relationships.create_index("is_blocked")
        await mongodb.contact_relationships.create_index("updated_at")
        await mongodb.contact_relationships.create_index([("user_id", 1), ("updated_at", -1)])
        
        # Chat threads collection
        await mongodb.chat_threads.create_index([("user_id", 1), ("contact_id", 1)], unique=True)
        await mongodb.chat_threads.create_index("updated_at")
        await mongodb.chat_threads.create_index("user_id")
        
        # Messages collection
        await mongodb.messages.create_index("thread_id")
        await mongodb.messages.create_index("timestamp")
        await mongodb.messages.create_index([("thread_id", 1), ("timestamp", -1)])
        
        # Campaigns collection
        await mongodb.campaigns.create_index("user_id")
        await mongodb.campaigns.create_index("created_at")
        await mongodb.campaigns.create_index([("user_id", 1), ("created_at", -1)])
        
        # Groups collection
        await mongodb.groups.create_index("creator_id")
        await mongodb.groups.create_index("community_id")
        await mongodb.groups.create_index("created_at")
        await mongodb.groups.create_index([("creator_id", 1), ("created_at", -1)])
        
        # Group members collection
        await mongodb.group_members.create_index([("group_id", 1), ("user_id", 1)], unique=True)
        await mongodb.group_members.create_index("user_id")
        await mongodb.group_members.create_index("group_id")
        
        # Group messages collection
        await mongodb.group_messages.create_index("group_id")
        await mongodb.group_messages.create_index("created_at")
        await mongodb.group_messages.create_index([("group_id", 1), ("created_at", -1)])
        
        # Communities collection
        await mongodb.communities.create_index("creator_id")
        await mongodb.communities.create_index("created_at")
        await mongodb.communities.create_index([("creator_id", 1), ("created_at", -1)])
        
        # Community members collection
        await mongodb.community_members.create_index([("community_id", 1), ("user_id", 1)], unique=True)
        await mongodb.community_members.create_index("user_id")
        await mongodb.community_members.create_index("community_id")
        
        # Channels collection
        await mongodb.channels.create_index("creator_id")
        await mongodb.channels.create_index("verified")
        await mongodb.channels.create_index("created_at")
        await mongodb.channels.create_index([("verified", 1), ("created_at", -1)])
        
        # Channel followers collection
        await mongodb.channel_followers.create_index([("channel_id", 1), ("user_id", 1)], unique=True)
        await mongodb.channel_followers.create_index("user_id")
        await mongodb.channel_followers.create_index("channel_id")
        
        # Channel messages collection
        await mongodb.channel_messages.create_index("channel_id")
        await mongodb.channel_messages.create_index("created_at")
        await mongodb.channel_messages.create_index([("channel_id", 1), ("created_at", -1)])
        
        # Templates collection
        await mongodb.templates.create_index("category")
        await mongodb.templates.create_index("status")
        await mongodb.templates.create_index([("category", 1), ("status", 1)])
        
        # Media files collection
        await mongodb.media_files.create_index("user_id")
        await mongodb.media_files.create_index("message_id")
        await mongodb.media_files.create_index("created_at")
        await mongodb.media_files.create_index([("user_id", 1), ("created_at", -1)])
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.warning(f"Error creating indexes: {e}")


def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance"""
    return mongodb
