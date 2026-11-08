import json
import logging
import datetime
from typing import Optional
from bson import ObjectId
from livekit.agents import llm
from server.database import db

logger = logging.getLogger(__name__)


class AssistantFnc(llm.Toolset):
    def __init__(self, username: str, room, session_meta: Optional[dict] = None):
        super().__init__(id="assistant_fnc")
        self.username = username
        self.room = room
        self.session_meta = session_meta or {}
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
        if self.session_meta.get("track") == "bda":
            return "Code editor is disabled for BDA/Sales assessments. Continue with the voice conversation."
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

        meta = self.session_meta
        session_id = meta.get("session_id") or ""
        assessment_id = meta.get("assessment_id") or None
        is_practice = bool(meta.get("is_practice", not bool(assessment_id)))
        assessor_id = meta.get("assessor_id") or None
        assessor_username = meta.get("assessor_username") or None
        taker_user_id = meta.get("taker_user_id") or None
        taker_username = meta.get("taker_username") or self.username
        taker_name = meta.get("taker_name") or taker_username
        taker_email = meta.get("taker_email") or ""
        share_with_taker = True if is_practice else bool(meta.get("share_with_taker", False))
        jd_file_id = meta.get("jd_file_id") or None

        logger.info(
            f"Submitting evaluation | session={session_id} | is_practice={is_practice} | "
            f"assessor={assessor_username} | taker={taker_name}"
        )

        if not jd_file_id and taker_username:
            latest_jd = await db.jd_files.find_one(
                {"username": assessor_username or taker_username},
                sort=[("uploaded_at", -1)],
                projection={"_id": 1}
            )
            if latest_jd:
                jd_file_id = str(latest_jd["_id"])

        now_iso = datetime.datetime.utcnow().isoformat() + "Z"
        evaluation = {
            "session_id": session_id,
            "assessment_id": assessment_id,
            "is_practice": is_practice,
            "assessor_id": assessor_id,
            "assessor_username": assessor_username,
            "taker_user_id": taker_user_id,
            "taker_username": taker_username,
            "taker_name": taker_name,
            "taker_email": taker_email,
            "username": assessor_username if (not is_practice and assessor_username) else taker_username,
            "share_with_taker": share_with_taker,
            "role_title": meta.get("role_title", "Assessment"),
            "track": meta.get("track", "tech"),
            "language": meta.get("language", "hinglish"),
            "timestamp": now_iso,
            "jd_id": jd_file_id,
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
            },
            "ai_disclaimer": "AI-generated assistive assessment. Final decision rests with the human reviewer."
        }
        await db.evaluations.insert_one(evaluation)

        # Mark session as completed in MongoDB
        if session_id and ObjectId.is_valid(session_id):
            await db.interview_sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {"state": "completed", "completed_at": now_iso}}
            )

        return "Evaluation saved successfully. Inform the user that their results have been saved and say goodbye."
