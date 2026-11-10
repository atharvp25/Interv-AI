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
        self.telemetry_tracker = None
        self.on_conclusion_requested = None  # Callback to coordinate speech playout and graceful closure

    def set_conclusion_callback(self, callback):
        self.on_conclusion_requested = callback

    def set_telemetry_tracker(self, tracker):
        self.telemetry_tracker = tracker

    async def _send_editor_command(self, command: str):
        """Send a DataChannel message to the frontend to open/close the code editor."""
        if self.room and hasattr(self.room, "local_participant"):
            await self.room.local_participant.publish_data(
                json.dumps({"type": command}).encode("utf-8")
            )

    @llm.function_tool(description="Internal background hook to open live code editor on screen. Never announce or speak this tool name out loud.")
    async def enable_code_editor(self):
        if self.session_meta.get("track") != "tech":
            return "Code editor is disabled for non-coding oral viva assessments. Continue strictly with the voice oral conversation."
        if self._editor_opened:
            logger.info("Code editor already open, skipping duplicate open")
            return "Code editor is already open. Just wait for the candidate to submit their code."
        logger.info("Opening code editor for candidate (LLM tool call)")
        self._code_attempts = 0  # Reset attempts for new coding question
        self._editor_opened = True
        await self._send_editor_command("enable_code_editor")
        return "Success. The code editor is now open. DO NOT read this message out loud. Just wait for the candidate to submit their code."

    @llm.function_tool(description="Internal background hook to close code editor. Never announce or speak this tool name out loud.")
    async def disable_code_editor(self):
        logger.info("Closing code editor (manual call by LLM)")
        await self._send_editor_command("disable_code_editor")
        return "Code editor closed. Continue with the interview."

    @llm.function_tool(description="Internal background hook to save final evaluation at the very end of the interview. Never announce or speak this tool name out loud.")
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

        meta = dict(self.session_meta)
        session_id = meta.get("session_id") or ""

        # Bulletproof recovery: if session_id is missing, extract it from room name "intervai-<session_id>-<hash>"
        if not session_id and self.room and getattr(self.room, "name", None):
            room_name = self.room.name
            if room_name.startswith("intervai-"):
                parts = room_name.split("-")
                if len(parts) >= 2 and len(parts[1]) == 24:
                    session_id = parts[1]
                    logger.info(f"submit_evaluation: Recovered session_id={session_id} from room.name")

        # Guaranteed DB session lookup to ensure assessor_id, assessment_id, and taker identity are never lost
        if session_id and ObjectId.is_valid(session_id):
            session_doc = await db.interview_sessions.find_one({"_id": ObjectId(session_id)})
            if session_doc:
                meta["assessment_id"] = session_doc.get("assessment_id") or meta.get("assessment_id")
                meta["assessor_id"] = session_doc.get("assessor_id") or meta.get("assessor_id")
                meta["assessor_username"] = session_doc.get("assessor_username") or meta.get("assessor_username")
                meta["taker_user_id"] = session_doc.get("taker_user_id") or meta.get("taker_user_id")
                meta["taker_username"] = session_doc.get("taker_username") or meta.get("taker_username")
                meta["taker_name"] = session_doc.get("taker_name") or meta.get("taker_name")
                meta["taker_email"] = session_doc.get("taker_email") or meta.get("taker_email")
                meta["is_practice"] = session_doc.get("is_practice", meta.get("is_practice", False))
                meta["share_with_taker"] = session_doc.get("share_with_taker", meta.get("share_with_taker", False))
                meta["role_title"] = session_doc.get("role_title") or meta.get("role_title")
                meta["track"] = session_doc.get("track") or meta.get("track")
                meta["discipline"] = session_doc.get("discipline") or meta.get("discipline") or meta.get("track")
                meta["specialization"] = session_doc.get("specialization") or meta.get("specialization")
                meta["language"] = session_doc.get("language") or meta.get("language")
                meta["jd_file_id"] = session_doc.get("jd_file_id") or meta.get("jd_file_id")

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
            f"Submitting evaluation | session={session_id} | assessment={assessment_id} | "
            f"is_practice={is_practice} | assessor={assessor_username} ({assessor_id}) | taker={taker_name}"
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
            "owner_id": assessor_id,
            "owner_username": assessor_username,
            "taker_user_id": taker_user_id,
            "taker_username": taker_username,
            "taker_name": taker_name,
            "taker_email": taker_email,
            "username": assessor_username if (not is_practice and assessor_username) else taker_username,
            "share_with_taker": share_with_taker,
            "role_title": meta.get("role_title", "Assessment"),
            "track": meta.get("track", "tech"),
            "discipline": meta.get("discipline", meta.get("track", "tech")),
            "specialization": meta.get("specialization", ""),
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

        # Attach real-time latency telemetry matrix (STT, LLM, TTS, E2E turnaround)
        telemetry_data = None
        if self.telemetry_tracker and hasattr(self.telemetry_tracker, "get_summary"):
            try:
                telemetry_data = self.telemetry_tracker.get_summary()
                evaluation["telemetry"] = telemetry_data
                logger.info(
                    f"Saved Latency Telemetry for session {session_id} | "
                    f"STT: {telemetry_data.get('avg_stt_ms')}ms | "
                    f"LLM: {telemetry_data.get('avg_llm_ms')}ms | "
                    f"TTS: {telemetry_data.get('avg_tts_ms')}ms | "
                    f"E2E: {telemetry_data.get('avg_e2e_ms')}ms | "
                    f"Turns: {telemetry_data.get('turn_count')}"
                )
            except Exception as e:
                logger.warning(f"Failed to compile latency telemetry: {e}")

        await db.evaluations.insert_one(evaluation)

        # Mark session as completed in MongoDB
        if session_id and ObjectId.is_valid(session_id):
            update_payload = {"state": "completed", "completed_at": now_iso}
            if telemetry_data:
                update_payload["telemetry"] = telemetry_data
            await db.interview_sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": update_payload}
            )

        # Notify the conclusion coordinator to manage audio playout and room closure
        if self.on_conclusion_requested:
            import asyncio
            asyncio.create_task(self.on_conclusion_requested(evaluation_source="tool"))
        else:
            # Standalone fallback for testing environments
            async def _delayed_room_closure():
                import asyncio
                await asyncio.sleep(8)
                try:
                    await self._send_editor_command("interview_completed")
                except Exception as e:
                    logger.warning(f"Failed to publish interview_completed: {e}")
                await asyncio.sleep(2.5)
                if self.room:
                    try:
                        await self.room.disconnect()
                    except Exception as e:
                        logger.warning(f"Error during room disconnect: {e}")

            import asyncio
            asyncio.create_task(_delayed_room_closure())

        return (
            "Evaluation saved successfully. Conclude immediately by saying: "
            "'Aapka interview complete ho chuka hai aur report successfully submit ho gayi hai. Thank you, and all the best!' "
            "Do not ask any more questions. The room will close automatically after your speech finishes."
        )

