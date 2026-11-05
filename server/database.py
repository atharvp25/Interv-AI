from motor.motor_asyncio import AsyncIOMotorClient
from server.config import MONGODB_URI

client = AsyncIOMotorClient(MONGODB_URI)
db = client.voice_agent_db
users_collection = db.users

