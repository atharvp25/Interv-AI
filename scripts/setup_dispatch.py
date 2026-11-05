import asyncio
import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from livekit import api
from server.config import LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET


async def main():
    print(f"Connecting to {LIVEKIT_URL}...")
    
    # Init LiveKit API
    lkapi = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    
    try:
        # Create a dispatch rule that sends the agent to ANY room
        rule = api.RoomDispatchRule(dispatch_all=api.RoomDispatchRule.DispatchAll())
        
        await lkapi.room.create_room_dispatch(
            rule=rule,
            agent_name="",
            name="Default Agent Dispatch Rule"
        )
        print("✅ SUCCESS! Agent Dispatch Rule created. LiveKit will now automatically send the agent to your rooms!")
    except Exception as e:
        print(f"Error creating dispatch rule (maybe it already exists?): {e}")
    finally:
        await lkapi.aclose()


if __name__ == "__main__":
    asyncio.run(main())

