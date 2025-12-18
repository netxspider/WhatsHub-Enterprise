from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings
import logging

logger = logging.getLogger(__name__)

# Global MongoDB client and database instances
mongodb_client: AsyncIOMotorClient = None
mongodb: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """Connect to MongoDB and initialize database"""
    global mongodb_client, mongodb
    
    try:
        logger.info(f"Connecting to MongoDB at {settings.mongodb_url}")
        mongodb_client = AsyncIOMotorClient(settings.mongodb_url)
        mongodb = mongodb_client[settings.database_name]
        
        # Test connection
        await mongodb_client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database: {settings.database_name}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


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
        
        # Contacts collection
        await mongodb.contacts.create_index([("user_id", 1), ("phone", 1)])
        await mongodb.contacts.create_index("user_id")
        
        # Chat threads collection
        await mongodb.chat_threads.create_index([("user_id", 1), ("contact_id", 1)], unique=True)
        await mongodb.chat_threads.create_index("updated_at")
        
        # Messages collection
        await mongodb.messages.create_index("thread_id")
        await mongodb.messages.create_index("timestamp")
        
        # Campaigns collection
        await mongodb.campaigns.create_index("user_id")
        await mongodb.campaigns.create_index("created_at")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.warning(f"Error creating indexes: {e}")


def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance"""
    return mongodb
