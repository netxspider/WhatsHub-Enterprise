"""
Database seeding script for WhatsHub Enterprise
Populates MongoDB with realistic mock data for demonstration purposes
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
import random
import logging

# Add parent directory to path to import project modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import connect_to_mongo, get_database, close_mongo_connection
from utils.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock data
USERS = [
    {"name": "Arnav Raj", "email": "arnav@whatshub.com", "password": "demo123"},
    {"name": "Priya Sharma", "email": "priya@whatshub.com", "password": "demo123"},
    {"name": "Vikram Singh", "email": "vikram@whatshub.com", "password": "demo123"},
]

CONTACTS = [
    {"name": "Arjun Singh", "phone": "+919876543210", "email": "arjun@example.com", "tags": ["VIP", "Wholesaler"], "source": "sheet", "address": "Jalandhar, Punjab"},
    {"name": "Priya Kapoor", "phone": "+919987654321", "email": "priya.k@example.com", "tags": ["New", "Retailer"], "source": "manual", "address": "Amritsar, Punjab"},
    {"name": "Manpreet Kaur", "phone": "+919812345678", "email": "manpreet@example.com", "tags": ["Customer"], "source": "sheet", "address": "Ludhiana, Punjab"},
    {"name": "Rahul Sharma", "phone": "+919765432109", "email": "rahul.s@example.com", "tags": ["Lead", "Pending Payment"], "source": "manual", "address": "Chandigarh"},
    {"name": "Simran Bhatia", "phone": "+919654321098", "email": "simran@example.com", "tags": ["VIP", "Wholesaler"], "source": "sheet", "address": "Delhi"},
    {"name": "Vikram Mehta", "phone": "+919543210987", "email": "vikram@example.com", "tags": ["Retailer"], "source": "manual", "address": "Jalandhar, Punjab"},
    {"name": "Anjali Patel", "phone": "+919432109876", "email": "anjali.p@example.com", "tags": ["Customer", "Loyal"], "source": "sheet", "address": "Mumbai, Maharashtra"},
    {"name": "Karan Gill", "phone": "+919321098765", "email": "karan@example.com", "tags": ["Lead"], "source": "manual", "address": "Bangalore, Karnataka"},
    {"name": "Neha Reddy", "phone": "+919210987654", "email": "neha.r@example.com", "tags": ["New", "Customer"], "source": "sheet", "address": "Hyderabad, Telangana"},
    {"name": "Amit Verma", "phone": "+919109876543", "email": "amit.v@example.com", "tags": ["Wholesaler", "VIP"], "source": "manual", "address": "Gurgaon, Haryana"},
    {"name": "Deepika Malhotra", "phone": "+919098765432", "email": "deepika@example.com", "tags": ["Customer"], "source": "sheet", "address": "Noida, UP"},
    {"name": "Rohit Kumar", "phone": "+918987654321", "email": "rohit@example.com", "tags": ["Lead", "Interested"], "source": "manual", "address": "Pune, Maharashtra"},
    {"name": "Sonia Gupta", "phone": "+918876543210", "email": "sonia@example.com", "tags": ["Retailer", "Active"], "source": "sheet", "address": "Surat, Gujarat"},
    {"name": "Rajesh Iyer", "phone": "+918765432109", "email": "rajesh@example.com", "tags": ["Wholesaler"], "source": "manual", "address": "Chennai, Tamil Nadu"},
    {"name": "Kavita Nair", "phone": "+918654321098", "email": "kavita@example.com", "tags": ["Customer", "VIP"], "source": "sheet", "address": "Kochi, Kerala"},
    {"name": "Aditya Joshi", "phone": "+918543210987", "email": "aditya@example.com", "tags": ["New"], "source": "manual", "address": "Indore, MP"},
    {"name": "Meera Prabhu", "phone": "+918432109876", "email": "meera@example.com", "tags": ["Lead", "Hot"], "source": "sheet", "address": "Coimbatore, Tamil Nadu"},
    {"name": "Suresh Pillai", "phone": "+918321098765", "email": "suresh@example.com", "tags": ["Retailer"], "source": "manual", "address": "Trivandrum, Kerala"},
    {"name": "Nisha Agarwal", "phone": "+918210987654", "email": "nisha@example.com", "tags": ["Customer"], "source": "sheet", "address": "Jaipur, Rajasthan"},
    {"name": "Kunal Shah", "phone": "+918109876543", "email": "kunal@example.com", "tags": ["Wholesaler", "Premium"], "source": "manual", "address": "Ahmedabad, Gujarat"},
]

# Extended contacts for more realistic data
EXTENDED_CONTACTS = [
    {"name": "Anand Krishnan", "phone": "+917098765432", "email": "anand@example.com", "tags": ["Customer"], "source": "sheet", "address": "Bangalore, Karnataka"},
    {"name": "Divya Menon", "phone": "+917087654321", "email": "divya@example.com", "tags": ["Lead"], "source": "manual", "address": "Mumbai, Maharashtra"},
    {"name": "Ravi Shankar", "phone": "+917076543210", "email": "ravi@example.com", "tags": ["Retailer", "Active"], "source": "sheet", "address": "Hyderabad, Telangana"},
    {"name": "Pooja Desai", "phone": "+717065432109", "email": "pooja@example.com", "tags": ["VIP"], "source": "manual", "address": "Pune, Maharashtra"},
    {"name": "Sanjay Reddy", "phone": "+917054321098", "email": "sanjay@example.com", "tags": ["Wholesaler"], "source": "sheet", "address": "Vizag, AP"},
    {"name": "Nikita Chawla", "phone": "+917043210987", "email": "nikita@example.com", "tags": ["Customer", "Loyal"], "source": "manual", "address": "Chandigarh"},
    {"name": "Harish Babu", "phone": "+917032109876", "email": "harish@example.com", "tags": ["New", "Interested"], "source": "sheet", "address": "Mysore, Karnataka"},
    {"name": "Shreya Kapoor", "phone": "+917021098765", "email": "shreya@example.com", "tags": ["Lead"], "source": "manual", "address": "Ludhiana, Punjab"},
    {"name": "Varun Malhotra", "phone": "+917010987654", "email": "varun@example.com", "tags": ["Retailer"], "source": "sheet", "address": "Amritsar, Punjab"},
    {"name": "Isha Bhatt", "phone": "+717009876543", "email": "isha@example.com", "tags": ["Customer"], "source": "manual", "address": "Vadodara, Gujarat"},
    {"name": "Tarun Singh", "phone": "+716998765432", "email": "tarun@example.com", "tags": ["Wholesaler", "VIP"], "source": "sheet", "address": "Jalandhar, Punjab"},
    {"name": "Pallavi Rao", "phone": "+716987654321", "email": "pallavi@example.com", "tags": ["Customer"], "source": "manual", "address": "Mangalore, Karnataka"},
    {"name": "Siddharth Jain", "phone": "+716976543210", "email": "siddharth@example.com", "tags": ["Lead", "Hot"], "source": "sheet", "address": "Indore, MP"},
    {"name": "Ritika Arora", "phone": "+716965432109", "email": "ritika@example.com", "tags": ["Retailer"], "source": "manual", "address": "Gurgaon, Haryana"},
    {"name": "Gaurav Thakur", "phone": "+716954321098", "email": "gaurav@example.com", "tags": ["Customer", "Active"], "source": "sheet", "address": "Shimla, HP"},
    {"name": "Tanvi Kulkarni", "phone": "+716943210987", "email": "tanvi@example.com", "tags": ["New"], "source": "manual", "address": "Nagpur, Maharashtra"},
    {"name": "Nikhil Pandey", "phone": "+716932109876", "email": "nikhil@example.com", "tags": ["Wholesaler"], "source": "sheet", "address": "Lucknow, UP"},
    {"name": "Aarti Saxena", "phone": "+716921098765", "email": "aarti@example.com", "tags": ["Customer"], "source": "manual", "address": "Kanpur, UP"},
    {"name": "Vivek Tiwari", "phone": "+716910987654", "email": "vivek@example.com", "tags": ["Lead"], "source": "sheet", "address": "Bhopal, MP"},
    {"name": "Swati Mishra", "phone": "+716909876543", "email": "swati@example.com", "tags": ["Retailer", "Premium"], "source": "manual", "address": "Patna, Bihar"},
]

ALL_CONTACTS = CONTACTS + EXTENDED_CONTACTS

MESSAGE_TEMPLATES = [
    "Hello! Thanks for your interest in our products.",
    "Hi there! How can I help you today?",
    "Thank you for reaching out. Our team will get back to you soon.",
    "Great to hear from you! What would you like to know?",
    "I'm interested in your wholesale pricing.",
    "Can you share more details about the product?",
    "What are your delivery options?",
    "Do you have this in stock?",
    "I'd like to place a bulk order.",
    "Can we schedule a call to discuss this?",
    "Thanks for the quick response!",
    "That sounds perfect. Let's proceed.",
    "Could you send me the product catalog?",
    "What payment methods do you accept?",
    "Is there a minimum order quantity?",
]


async def seed_database(reset=False):
    """Seed the database with mock data"""
    try:
        await connect_to_mongo()
        db = get_database()
        
        logger.info("Starting database seeding...")
        
        # Reset database if requested
        if reset:
            logger.info("Resetting database...")
            await db.users.delete_many({})
            await db.contacts.delete_many({})
            await db.messages.delete_many({})
            await db.chat_threads.delete_many({})
            await db.campaigns.delete_many({})
            await db.templates.delete_many({})
            logger.info("Database reset complete")
        
        # Seed users
        logger.info("Seeding users...")
        user_ids = []
        for user_data in USERS:
            existing = await db.users.find_one({"email": user_data["email"]})
            if not existing:
                user_doc = {
                    "name": user_data["name"],
                    "email": user_data["email"],
                    "hashed_password": get_password_hash(user_data["password"]),
                    "created_at": datetime.utcnow(),
                    "phone": None,
                    "business_name": None,
                    "business_address": None,
                    "website": None,
                    "business_hours": None,
                    "business_description": None,
                    "about": "Available",
                }
                result = await db.users.insert_one(user_doc)
                user_ids.append(str(result.inserted_id))
                logger.info(f"Created user: {user_data['email']}")
            else:
                user_ids.append(str(existing["_id"]))
                logger.info(f"User already exists: {user_data['email']}")
        
        # Use first user for seeding contacts and campaigns
        primary_user_id = user_ids[0]
        
        # Seed contacts
        logger.info("Seeding contacts...")
        contact_ids = []
        for contact_data in ALL_CONTACTS:
            existing = await db.contacts.find_one({
                "user_id": primary_user_id,
                "phone": contact_data["phone"]
            })
            if not existing:
                contact_doc = {
                    **contact_data,
                    "user_id": primary_user_id,
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 60))
                }
                result = await db.contacts.insert_one(contact_doc)
                contact_ids.append(str(result.inserted_id))
            else:
                contact_ids.append(str(existing["_id"]))
        logger.info(f"Created/verified {len(contact_ids)} contacts")
        
        # Seed chat threads and messages for first 15 contacts
        logger.info("Seeding chat threads and messages...")
        for i, contact_id in enumerate(contact_ids[:15]):
            # Create chat thread
            existing_thread = await db.chat_threads.find_one({
                "user_id": primary_user_id,
                "contact_id": contact_id
            })
            
            if not existing_thread:
                thread_doc = {
                    "user_id": primary_user_id,
                    "contact_id": contact_id,
                    "last_message": None,
                    "last_message_time": None,
                    "unread_count": 0,
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                    "updated_at": datetime.utcnow() - timedelta(hours=random.randint(1, 72))
                }
                thread_result = await db.chat_threads.insert_one(thread_doc)
                thread_id = str(thread_result.inserted_id)
            else:
                thread_id = str(existing_thread["_id"])
            
            # Create 5-10 messages per thread
            num_messages = random.randint(5, 10)
            for j in range(num_messages):
                direction = "outbound" if j % 2 == 0 else "inbound"
                status_options = ["sent", "delivered", "read"]
                
                message_doc = {
                    "thread_id": thread_id,
                    "contact_id": contact_id,
                    "user_id": primary_user_id,
                    "content": random.choice(MESSAGE_TEMPLATES),
                    "direction": direction,
                    "status": random.choice(status_options) if direction == "outbound" else "delivered",
                    "type": "text",
                    "timestamp": datetime.utcnow() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23)),
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 7))
                }
                await db.messages.insert_one(message_doc)
            
            # Update thread with last message
            last_message = await db.messages.find_one(
                {"thread_id": thread_id},
                sort=[("timestamp", -1)]
            )
            if last_message:
                await db.chat_threads.update_one(
                    {"_id": thread_result.inserted_id if not existing_thread else existing_thread["_id"]},
                    {"$set": {
                        "last_message": last_message["content"],
                        "last_message_time": last_message["timestamp"],
                        "updated_at": last_message["timestamp"]
                    }}
                )
        
        logger.info("Created chat threads and messages")
        
        # Seed campaigns
        logger.info("Seeding campaigns...")
        campaign_names = [
            "Summer Sale 2024",
            "Diwali Special Offers",
            "New Product Launch",
            "Customer Appreciation Week",
            "Wholesale Partner Drive",
            "Festival Season Promotion",
            "Year End Clearance"
        ]
        
        for i, campaign_name in enumerate(campaign_names):
            existing_campaign = await db.campaigns.find_one({
                "user_id": primary_user_id,
                "name": campaign_name
            })
            
            if not existing_campaign:
                # Select random contacts for campaign
                campaign_contact_ids = random.sample(contact_ids, min(random.randint(10, 25), len(contact_ids)))
                
                campaign_doc = {
                    "name": campaign_name,
                    "user_id": primary_user_id,
                    "sheet_url": f"https://docs.google.com/spreadsheets/d/mock_id_{i}/edit",
                    "sheet_name": "Sheet1",
                    "template_id": None,
                    "status": random.choice(["completed", "active", "draft"]),
                    "total_contacts": len(campaign_contact_ids),
                    "contacts_imported": len(campaign_contact_ids),
                    "messages_sent": random.randint(int(len(campaign_contact_ids) * 0.8), len(campaign_contact_ids)),
                    "messages_delivered": random.randint(int(len(campaign_contact_ids) * 0.6), int(len(campaign_contact_ids) * 0.9)),
                    "messages_read": random.randint(int(len(campaign_contact_ids) * 0.3), int(len(campaign_contact_ids) * 0.7)),
                    "messages_failed": random.randint(0, int(len(campaign_contact_ids) * 0.1)),
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                    "updated_at": datetime.utcnow() - timedelta(hours=random.randint(1, 24))
                }
                await db.campaigns.insert_one(campaign_doc)
                logger.info(f"Created campaign: {campaign_name}")
        
        logger.info("✅ Database seeding completed successfully!")
        logger.info(f"Created {len(user_ids)} users, {len(contact_ids)} contacts, and {len(campaign_names)} campaigns")
        
        # Seed channels
        logger.info("Seeding channels...")
        channel_names = [
            {"name": "Product Updates", "description": "Latest product updates and announcements"},
            {"name": "Tech News", "description": "Technology news and trends"},
            {"name": "Marketing Tips", "description": "Marketing strategies and tips"},
            {"name": "Customer Success Stories", "description": "Real stories from our customers"},
        ]
        
        for channel_data in channel_names:
            existing= await db.channels.find_one({
                "creator_id": primary_user_id,
                "name": channel_data["name"]
            })
            
            if not existing:
                channel_doc = {
                    **channel_data,
                    "creator_id": primary_user_id,
                    "followers_count": random.randint(50, 500),
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 90))
                }
                await db.channels.insert_one(channel_doc)
                logger.info(f"Created channel: {channel_data['name']}")
        
        # Seed communities
        logger.info("Seeding communities...")
        community_names = [
            {"name": "Tech Community", "description": "A community for tech enthusiasts"},
            {"name": "Business Network", "description": "Connect with business professionals"},
            {"name": "Developers Hub", "description": "For developers to collaborate"},
        ]
        
        for community_data in community_names:
            existing = await db.communities.find_one({
                "creator_id": primary_user_id,
                "name": community_data["name"]
            })
            
            if not existing:
                # Create community
                community_doc = {
                    **community_data,
                    "creator_id": primary_user_id,
                    "members_count": random.randint(20, 200),
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 60))
                }
                community_result = await db.communities.insert_one(community_doc)
                community_id = str(community_result.inserted_id)
                
                # Create announcement group
                announcement_group = {
                    "name": "Announcements",
                    "description": "Official announcements",
                    "community_id": community_id,
                    "creator_id": primary_user_id,
                    "members_count": community_doc["members_count"],
                    "created_at": datetime.utcnow()
                }
                announcement_result = await db.groups.insert_one(announcement_group)
                announcement_group_id = str(announcement_result.inserted_id)
                
                # Update community with announcement group id
                await db.communities.update_one(
                    {"_id": community_result.inserted_id},
                    {"$set": {"announcement_group_id": announcement_group_id}}
                )
                
                # Create 2-3 additional groups
                group_names = ["General", "Random", "Support", "Q&A"]
                num_groups = random.randint(2, 3)
                for group_name in random.sample(group_names, num_groups):
                    group_doc = {
                        "name": group_name,
                        "description": f"{group_name} discussion group",
                        "community_id": community_id,
                        "creator_id": primary_user_id,
                        "members_count": random.randint(10, 100),
                        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30))
                    }
                    await db.groups.insert_one(group_doc)
                
                logger.info(f"Created community: {community_data['name']}")
        
        logger.info("✅ All seeding completed!")
        logger.info(f"Database now has: {len(user_ids)} users, {len(contact_ids)} contacts, {len(campaign_names)} campaigns, {len(channel_names)} channels, and {len(community_names)} communities")
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    import sys
    reset = "--reset" in sys.argv
    asyncio.run(seed_database(reset=reset))
