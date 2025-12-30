"""
MongoDB Database Connection and Configuration
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection String
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "audiolore")

# Async client for FastAPI
async_client: AsyncIOMotorClient = None
async_db = None

# Sync client for non-async operations
sync_client: MongoClient = None
sync_db = None


def get_database():
    """Get synchronous database instance"""
    global sync_client, sync_db
    if sync_db is None:
        sync_client = MongoClient(MONGODB_URL)
        sync_db = sync_client[DATABASE_NAME]
    return sync_db


async def connect_to_mongo():
    """Connect to MongoDB (async)"""
    global async_client, async_db
    try:
        async_client = AsyncIOMotorClient(MONGODB_URL)
        async_db = async_client[DATABASE_NAME]
        # Verify connection
        await async_client.admin.command('ping')
        print(f"✓ Connected to MongoDB: {DATABASE_NAME}")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    global async_client
    if async_client:
        async_client.close()
        print("✓ Closed MongoDB connection")


def get_async_database():
    """Get async database instance"""
    return async_db


# Collection names
BOOKS_COLLECTION = "books"
SCRIPTS_COLLECTION = "scripts"
VOICES_COLLECTION = "voices"
