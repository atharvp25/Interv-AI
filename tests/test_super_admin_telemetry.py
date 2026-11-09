import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
from bson import ObjectId
from server.database import db, users_collection
from server.core.security import _serialize_user, create_access_token, SUPER_ADMIN_EMAILS
from server.agent.worker import InterviewTelemetryTracker

async def test_super_admin_and_telemetry():
    print("Testing Super Admin recognition & Telemetry engine...")

    # 1. Test Super Admin identification for atharvep25@gmail.com
    super_user_doc = {
        "_id": ObjectId("6af0925a753253c58d7ebe21"),
        "username": "atharvep25",
        "email": "atharvep25@gmail.com",
        "full_name": "Atharv Pandav",
        "role": "recruiter"
    }
    serialized = _serialize_user(super_user_doc)
    assert serialized["is_super_admin"] is True, "atharvep25@gmail.com must be identified as Super Admin"
    print("✅ Super Admin correctly recognized for atharvep25@gmail.com")

    # 2. Test Non-admin user
    regular_user = {
        "_id": ObjectId(),
        "username": "candidate_john",
        "email": "john@example.com",
        "full_name": "John Doe",
        "role": "candidate"
    }
    serialized_reg = _serialize_user(regular_user)
    assert serialized_reg["is_super_admin"] is False, "Regular user must not be Super Admin"
    print("✅ Regular candidate correctly isolated from Super Admin privileges")

    # 3. Test Telemetry Tracker Calculations
    tracker = InterviewTelemetryTracker()
    
    # Turn 1
    tracker.record_user_speech_end(timestamp=100.0)
    tracker.record_user_transcript(text="Hello, am I audible?", transcript_delay=0.75)
    tracker.record_llm_response(text="Yes, you are perfectly audible.")
    # Simulate agent speech
    tracker.current_turn["tts_done_ts"] = 101.8
    tracker.current_turn["total_e2e_ms"] = 1800.0
    tracker.current_turn["tts_ms"] = 310.0
    tracker.current_turn["llm_ms"] = 740.0
    tracker.turns.append(dict(tracker.current_turn))

    # Turn 2
    tracker.record_user_speech_end(timestamp=110.0)
    tracker.record_user_transcript(text="My name is Demo Two.", transcript_delay=0.62)
    tracker.record_llm_response(text="Nice to meet you Demo Two.")
    tracker.current_turn["tts_done_ts"] = 111.7
    tracker.current_turn["total_e2e_ms"] = 1700.0
    tracker.current_turn["tts_ms"] = 320.0
    tracker.current_turn["llm_ms"] = 760.0
    tracker.turns.append(dict(tracker.current_turn))

    summary = tracker.get_summary()
    assert summary["turn_count"] == 2, "Turn count must be 2"
    assert summary["avg_e2e_ms"] == 1750.0, f"Expected 1750.0, got {summary['avg_e2e_ms']}"
    assert summary["avg_tts_ms"] == 315.0, f"Expected 315.0, got {summary['avg_tts_ms']}"
    assert summary["avg_llm_ms"] == 750.0, f"Expected 750.0, got {summary['avg_llm_ms']}"
    print(f"✅ Telemetry Tracker precision verified: {summary}")

    print("🎉 ALL SUPER ADMIN & TELEMETRY TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(test_super_admin_and_telemetry())

