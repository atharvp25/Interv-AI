import os
import json
import logging
import datetime
from livekit.agents import llm
from motor.motor_asyncio import AsyncIOMotorClient

from server.config import MONGODB_URI

logger = logging.getLogger(__name__)


class AssistantFnc(llm.Toolset):
    def __init__(self, username: str, room):
        super().__init__(id="assistant_fnc")
        self.username = username
        self.room = room
        self._submitted = False
        self._code_attempts = 0
        self._max_attempts = 3
        self._editor_opened = False  # Track if editor has been opened

    async def _send_editor_command(self, command: str):
        """Send a DataChannel message to the frontend to open/close the code editor."""
        if self.room and hasattr(self.room, "local_participant"):
            await self.room.local_participant.publish_data(
                json.dumps({"type": command}).encode("utf-8")
            )

    @llm.function_tool(description="Open the code editor on the candidate's screen. Call this IMMEDIATELY when you ask a coding question.")
    async def enable_code_editor(self):
        if self._editor_opened:
            logger.info("Code editor already open, skipping duplicate open")
            return "Code editor is already open. Just wait for the candidate to submit their code."
        logger.info("Opening code editor for candidate (LLM tool call)")
        self._code_attempts = 0  # Reset attempts for new coding question
        self._editor_opened = True
        await self._send_editor_command("enable_code_editor")
        return "Success. The code editor is now open. DO NOT read this message out loud. Just wait for the candidate to submit their code."

    @llm.function_tool(description="Close the code editor. Only call this if the candidate explicitly asks to skip the coding question. The system automatically closes the editor when code is correct or after 3 failed attempts.")
    async def disable_code_editor(self):
        logger.info("Closing code editor (manual call by LLM)")
        await self._send_editor_command("disable_code_editor")
        return "Code editor closed. Continue with the interview."

    @llm.function_tool(description="Called ONLY at the very end of the interview to save the candidate's final evaluation scores and detailed feedback.")
    async def submit_evaluation(
        self,
        technical_accuracy: int,
        communication: int,
        confidence: int,
        depth: int,
        completeness: int,
        overall_score: int,
        strengths: list[str],
        areas_for_improvement: list[str],
        summary: str
    ):
        if self._submitted:
            logger.info(f"Evaluation already submitted for user: {self.username}, skipping duplicate.")
            return "Evaluation was already submitted. Just thank the candidate and say goodbye."
        self._submitted = True

        logger.info(f"Submitting evaluation for user: {self.username}")
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client.voice_agent_db
        
        latest_jd = await db.jd_files.find_one(
            {"username": self.username},
            sort=[("uploaded_at", -1)],
            projection={"_id": 1}
        )

        evaluation = {
            "username": self.username,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "jd_id": latest_jd["_id"] if latest_jd else None,
            "scores": {
                "technical_accuracy": technical_accuracy,
                "communication": communication,
                "confidence": confidence,
                "depth": depth,
                "completeness": completeness,
                "overall_score": overall_score
            },
            "feedback": {
                "strengths": strengths,
                "areas_for_improvement": areas_for_improvement,
                "summary": summary
            }
        }
        await db.evaluations.insert_one(evaluation)
        return "Evaluation saved successfully. Inform the user that their results have been saved and say goodbye."

