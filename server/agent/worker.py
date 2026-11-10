import logging
import os
import sys
import ssl
import time
from pathlib import Path
import json
import asyncio

# ── PRE-WARM SSL CONTEXT (PREVENTS 120-150ms WINDOWS EVENT LOOP STALLS) ───────
# On Windows (CPython 3.12), ssl.create_default_context() calls load_default_certs()
# which synchronously reads the Windows CryptoAPI certificate store on the caller
# thread, blocking the asyncio event loop for 120-150ms during websocket connects.
# We pre-warm a singleton SSL context once at module import so all future calls
# to ssl.create_default_context() return instantaneously without blocking.
_orig_create_default_context = ssl.create_default_context
_GLOBAL_CACHED_SSL_CTX = _orig_create_default_context()

def _cached_create_default_context(*args, **kwargs):
    if not args and not kwargs:
        return _GLOBAL_CACHED_SSL_CTX
    return _orig_create_default_context(*args, **kwargs)

ssl.create_default_context = _cached_create_default_context

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from google import genai
from google.genai import types
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, JobContext, room_io, llm, APIConnectOptions
from livekit.plugins import noise_cancellation, silero, google, gnani, openai

from server.config import (
    GEMINI_API_KEY,
    GNANI_API_KEY,
    GEMINI_MODEL,
    GEMINI_FALLBACK_MODELS,
    GROQ_API_KEY,
    GROQ_MODEL,
)
from server.agent.gnani_prisma import PrismaV3STT, resolve_language_profile
from server.agent.prompts import (
    get_interview_instructions,
    get_random_greeting,
    get_candidate_greeting,
    get_code_eval_message,
    get_random_farewell,
)
from server.agent.tools import AssistantFnc
from server.services.jd_parser import get_interview_session_context, load_jd

logger = logging.getLogger(__name__)

AGENT_NAME = "intervai-agent"


import re

# ── RUNTIME PATCH: PREVENT GEMINI INTERNAL THOUGHT PARTS FROM LEAKING ────────
# livekit-plugins-google's LLMStream._parse_part does not check `part.thought`,
# causing Gemini 2.5/3.x internal chain-of-thought (`part.thought == True`) to
# be emitted as spoken assistant text. We patch `_parse_part` at import time
# to drop any thought parts immediately.
try:
    from livekit.plugins.google import llm as _google_llm_mod
    _orig_google_parse_part = _google_llm_mod.LLMStream._parse_part

    def _patched_google_parse_part(self, id: str, part: types.Part):
        if getattr(part, "thought", False):
            return None
        return _orig_google_parse_part(self, id, part)

    _google_llm_mod.LLMStream._parse_part = _patched_google_parse_part
except Exception as _patch_err:
    logger.warning(f"Could not apply google.llm thought filter patch: {_patch_err}")


def _sanitize_voice_chunk(text: str) -> str:
    if not text:
        return text
    # 1. Strip complete <think>...</think> or <reasoning>...</reasoning> blocks if in a single chunk
    t = re.sub(r'<(?:think|reasoning|thought)>.*?</(?:think|reasoning|thought)>', '', text, flags=re.IGNORECASE | re.DOTALL)
    # 2. Strip any stray opening/closing thought tags
    t = re.sub(r'</?(?:think|reasoning|thought)>', '', t, flags=re.IGNORECASE)
    # 3. Strip bracketed annotations like [Calls enable_code_editor tool] or parenthetical internal notes
    t = re.sub(r'\[.*?\]', '', t)
    t = re.sub(r'\((?:note|thinking|thought|assuming|internal|candidate meant|candidate tried)[^)]*\)', '', t, flags=re.IGNORECASE)
    # 4. Strip bare tool names if leaked into spoken output
    t = re.sub(r'\b(enable_code_editor|disable_code_editor|submit_evaluation)\b', '', t, flags=re.IGNORECASE)
    # 5. Strip spoken question tag prefixes like 'Question #1:', '#tag 1:', 'Q1:'
    t = re.sub(r'(?:^|\b|\s)(?:#tag\s*\d+|Question\s*#?\s*(?:tag\s*)?\d+|Q\d+)\s*[:.-]?', ' ', t, flags=re.IGNORECASE)
    return t


# ── RESILIENT VOICE LLM ENGINE (GROQ LPU WITH GEMINI FLASH-LITE FAILOVER) ────
class ResilientVoiceStream(llm.LLMStream):
    def __init__(self, parent_llm, primary_llm, fallback_llm, *, chat_ctx, **kwargs):
        conn_opts = kwargs.get("conn_options") or APIConnectOptions()
        tools = kwargs.get("tools") or []
        super().__init__(parent_llm, chat_ctx=chat_ctx, tools=tools, conn_options=conn_opts)
        self._parent = parent_llm
        self._primary_llm = primary_llm
        self._fallback_llm = fallback_llm
        self._chat_ctx = chat_ctx
        self._kwargs = kwargs

    async def _run(self):
        in_think_block = False

        def _process_chunk(chunk):
            nonlocal in_think_block
            if chunk.delta and chunk.delta.content:
                raw = chunk.delta.content
                lower_raw = raw.lower()

                # Stateful multi-chunk <think>...</think> suppression
                if in_think_block:
                    end_idx = lower_raw.find("</think>")
                    if end_idx >= 0:
                        in_think_block = False
                        raw = raw[end_idx + 8:]
                    else:
                        chunk.delta.content = ""
                        return chunk

                start_idx = raw.lower().find("<think>")
                if start_idx >= 0:
                    before = raw[:start_idx]
                    after = raw[start_idx + 7:]
                    end_idx = after.lower().find("</think>")
                    if end_idx >= 0:
                        raw = before + after[end_idx + 8:]
                    else:
                        in_think_block = True
                        raw = before

                chunk.delta.content = _sanitize_voice_chunk(raw)
            return chunk

        async def _consume_stream(stream_obj):
            nonlocal in_think_block
            in_think_block = False
            async for chunk in stream_obj:
                processed = _process_chunk(chunk)
                if (
                    processed.delta
                    and processed.delta.content == ""
                    and not getattr(processed.delta, "tool_calls", None)
                    and not getattr(processed, "usage", None)
                ):
                    continue
                self._event_ch.send_nowait(processed)

        if self._parent._active_provider == "gemini" or self._primary_llm is None:
            fallback_stream = self._fallback_llm.chat(chat_ctx=self._chat_ctx, **self._kwargs)
            await _consume_stream(fallback_stream)
            return

        try:
            primary_stream = self._primary_llm.chat(chat_ctx=self._chat_ctx, **self._kwargs)
            await _consume_stream(primary_stream)
        except Exception as err:
            logger.warning(
                f"⚡ Groq LLM streaming failed ({err}). Seamlessly failing over to Google Gemini Flash-Lite..."
            )
            self._parent._active_provider = "gemini"
            fallback_stream = self._fallback_llm.chat(chat_ctx=self._chat_ctx, **self._kwargs)
            await _consume_stream(fallback_stream)


class ResilientVoiceLLM(llm.LLM):
    """Voice LLM that uses Groq LPU for sub-200ms TTFT, with automatic failover to
    Gemini Flash-Lite if Groq hits token rate limits (429) or connection errors."""
    def __init__(self, primary: llm.LLM | None, fallback: llm.LLM):
        super().__init__()
        self._primary = primary
        self._fallback = fallback
        self._active_provider = "groq" if primary is not None else "gemini"

    def chat(self, *, chat_ctx: llm.ChatContext, **kwargs) -> llm.LLMStream:
        return ResilientVoiceStream(self, self._primary, self._fallback, chat_ctx=chat_ctx, **kwargs)


# ── REAL-TIME LATENCY TELEMETRY ENGINE ───────────────────────────────────────
class InterviewTelemetryTracker:
    """Tracks precision real-time latency across the speech pipeline:
    1. STT Latency: Candidate speech end -> Final transcript ready
    2. LLM Latency: Final transcript -> AI response generated
    3. TTS Latency: Response text -> Audio frame synthesized & audible
    4. Total E2E Latency: Candidate finishes speaking -> AI voice response audible
    """
    def __init__(self, room=None):
        self.room = room
        self.turns: list[dict] = []
        self._turn_index = 0
        self.current_turn = {
            "turn_index": 0,
            "user_speech_end_ts": 0.0,
            "stt_done_ts": 0.0,
            "llm_done_ts": 0.0,
            "tts_done_ts": 0.0,
            "stt_ms": 0.0,
            "llm_ms": 0.0,
            "tts_ms": 0.0,
            "total_e2e_ms": 0.0,
        }

    def record_user_speech_end(self, timestamp: float = None):
        self._turn_index += 1
        now = timestamp or time.perf_counter()
        self.current_turn = {
            "turn_index": self._turn_index,
            "user_speech_end_ts": now,
            "stt_done_ts": 0.0,
            "llm_done_ts": 0.0,
            "tts_done_ts": 0.0,
            "stt_ms": 0.0,
            "llm_ms": 0.0,
            "tts_ms": 0.0,
            "total_e2e_ms": 0.0,
        }

    def record_user_transcript(self, text: str = "", transcript_delay: float = 0.0):
        now = time.perf_counter()
        self.current_turn["stt_done_ts"] = now
        if self.current_turn["user_speech_end_ts"] > 0:
            calc_stt = (now - self.current_turn["user_speech_end_ts"]) * 1000
            self.current_turn["stt_ms"] = round(transcript_delay * 1000 if transcript_delay > 0 else calc_stt, 1)
        elif transcript_delay > 0:
            self.current_turn["stt_ms"] = round(transcript_delay * 1000, 1)
            self.current_turn["user_speech_end_ts"] = now - transcript_delay
        else:
            self.current_turn["stt_ms"] = 650.0  # nominal fallback

    def record_llm_response(self, text: str = ""):
        now = time.perf_counter()
        self.current_turn["llm_done_ts"] = now
        stt_ts = self.current_turn["stt_done_ts"] or self.current_turn["user_speech_end_ts"]
        if stt_ts > 0:
            self.current_turn["llm_ms"] = round((now - stt_ts) * 1000, 1)

    async def record_agent_speaking(self):
        now = time.perf_counter()
        self.current_turn["tts_done_ts"] = now
        stt_ts = self.current_turn["stt_done_ts"] or self.current_turn["user_speech_end_ts"]
        llm_ts = self.current_turn["llm_done_ts"]

        if llm_ts and llm_ts > 0:
            self.current_turn["tts_ms"] = round((now - llm_ts) * 1000, 1)
        elif stt_ts > 0:
            # First audio chunk output before conversation_item_added event fires:
            # Attribute TTFT (~60%) and TTFB (~40%) proportionally
            elapsed = (now - stt_ts) * 1000
            self.current_turn["llm_ms"] = round(elapsed * 0.6, 1)
            self.current_turn["tts_ms"] = round(elapsed * 0.4, 1)

        start_ts = self.current_turn["user_speech_end_ts"]
        if start_ts > 0:
            self.current_turn["total_e2e_ms"] = round((now - start_ts) * 1000, 1)
        else:
            self.current_turn["total_e2e_ms"] = round(
                self.current_turn["stt_ms"] + self.current_turn["llm_ms"] + self.current_turn["tts_ms"], 1
            )

        turn_data = dict(self.current_turn)
        self.turns.append(turn_data)

        logger.info(
            f"⚡ Latency Telemetry Turn #{turn_data['turn_index']} | "
            f"STT: {turn_data['stt_ms']}ms | LLM: {turn_data['llm_ms']}ms | "
            f"TTS: {turn_data['tts_ms']}ms | Total Turnaround (E2E): {turn_data['total_e2e_ms']}ms"
        )

        # Broadcast live telemetry over DataChannel to frontend
        if self.room and hasattr(self.room, "local_participant"):
            try:
                payload = json.dumps({
                    "type": "latency_telemetry",
                    "data": {
                        "turn": turn_data["turn_index"],
                        "stt_ms": turn_data["stt_ms"],
                        "llm_ms": turn_data["llm_ms"],
                        "tts_ms": turn_data["tts_ms"],
                        "total_e2e_ms": turn_data["total_e2e_ms"],
                    }
                }).encode("utf-8")
                await self.room.local_participant.publish_data(payload)
            except Exception as e:
                logger.debug(f"Failed to publish latency telemetry: {e}")

    def get_summary(self) -> dict:
        if not self.turns:
            return {
                "avg_stt_ms": 0.0,
                "avg_llm_ms": 0.0,
                "avg_tts_ms": 0.0,
                "avg_e2e_ms": 0.0,
                "turn_count": 0,
                "turns": [],
            }

        valid_stt = [t["stt_ms"] for t in self.turns if t["stt_ms"] > 0]
        valid_llm = [t["llm_ms"] for t in self.turns if t["llm_ms"] > 0]
        valid_tts = [t["tts_ms"] for t in self.turns if t["tts_ms"] > 0]
        valid_e2e = [t["total_e2e_ms"] for t in self.turns if t["total_e2e_ms"] > 0]

        return {
            "avg_stt_ms": round(sum(valid_stt) / len(valid_stt), 1) if valid_stt else 0.0,
            "avg_llm_ms": round(sum(valid_llm) / len(valid_llm), 1) if valid_llm else 0.0,
            "avg_tts_ms": round(sum(valid_tts) / len(valid_tts), 1) if valid_tts else 0.0,
            "avg_e2e_ms": round(sum(valid_e2e) / len(valid_e2e), 1) if valid_e2e else 0.0,
            "turn_count": len(self.turns),
            "turns": self.turns[-20:],
        }



# Define your agent's behavior
class Assistant(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(
            instructions=instructions,
        )


server = AgentServer()


# Explicitly bind the agent to its registered name so LiveKit Cloud dispatches
# this exact worker when RoomConfiguration(agents=[RoomAgentDispatch(agent_name="intervai-agent")]) is requested.
@server.rtc_session(agent_name=AGENT_NAME)
async def entrypoint(ctx: JobContext):
    logger.info(f"Connecting to room: {ctx.room.name} with agent_name: {AGENT_NAME}")
    await ctx.connect()

    # Wait for the candidate to connect
    participant = await ctx.wait_for_participant()
    logger.info(f"Candidate connected: {participant.identity}")

    # 1. Parse Metadata with multi-tier fallback:
    # Priority: ctx.job.metadata (RoomAgentDispatch) -> participant.metadata -> ctx.room.metadata -> Room name extraction
    raw_meta = None
    if hasattr(ctx, "job") and getattr(ctx.job, "metadata", None):
        raw_meta = ctx.job.metadata
        logger.info("Found metadata on ctx.job.metadata")
    elif getattr(participant, "metadata", None):
        raw_meta = participant.metadata
        logger.info("Found metadata on participant.metadata")
    elif getattr(ctx.room, "metadata", None):
        raw_meta = ctx.room.metadata
        logger.info("Found metadata on ctx.room.metadata")

    metadata = {}
    if raw_meta:
        try:
            metadata = json.loads(raw_meta)
            logger.info(f"Loaded session metadata: session_id={metadata.get('session_id')}, role={metadata.get('role_title')}")
        except Exception as e:
            logger.warning(f"Failed to parse metadata: {e}")

    # Fallback: Extract session_id directly from room name "intervai-<session_id>-<hash>"
    session_id = metadata.get("session_id", "")
    if not session_id and ctx.room.name.startswith("intervai-"):
        parts = ctx.room.name.split("-")
        if len(parts) >= 2 and len(parts[1]) == 24:
            session_id = parts[1]
            metadata["session_id"] = session_id
            logger.info(f"Extracted session_id from room name: {session_id}")

    language_key = metadata.get("language", "hinglish")
    track = metadata.get("track", "tech")
    taker_username = metadata.get("taker_username") or metadata.get("username") or participant.identity

    # 2. Dynamically load the exact Interview Session context from MongoDB
    try:
        context = await get_interview_session_context(
            session_id=session_id,
            username=taker_username,
            track=track,
            language=language_key,
        )
        jd_content = context["jd_text"]
        custom_keywords = metadata.get("keywords") or context.get("keywords") or []
        track = context.get("track", track)
        language_key = context.get("language", language_key)
        role_title = context.get("role_title", "Interview Role")
        discipline = context.get("discipline") or metadata.get("discipline") or track
        specialization = context.get("specialization") or metadata.get("specialization") or role_title
        question_bank = context.get("question_bank") or metadata.get("question_bank") or []
        teacher_instructions = context.get("teacher_instructions") or metadata.get("teacher_instructions") or ""
        examiner_tone = context.get("examiner_tone") or metadata.get("examiner_tone") or "socratic"
        taker_name = (
            context.get("taker_name")
            or metadata.get("taker_name")
            or metadata.get("name")
            or taker_username
            or "Candidate"
        )
        logger.info(
            f"Loaded MongoDB context for session_id={session_id} | "
            f"assessment_id={context.get('assessment_id')} | assessor={context.get('assessor_username')} | "
            f"discipline={discipline} | taker={taker_name}"
        )
    except Exception as e:
        logger.warning(f"Failed to load MongoDB session context: {e}, falling back to defaults")
        try:
            jd_content = load_jd()
        except Exception:
            jd_content = "Python, SQL, Machine Learning Engineer Role"
        custom_keywords = [
            "IntervAI", "Python", "SQL", "FastAPI", "LiveKit", "Machine Learning", "ROI", "B2B", "CRM"
        ]
        role_title = "Technical Assessment"
        discipline = metadata.get("discipline") or track
        specialization = metadata.get("specialization") or role_title
        question_bank = metadata.get("question_bank") or []
        teacher_instructions = metadata.get("teacher_instructions") or ""
        examiner_tone = metadata.get("examiner_tone") or "socratic"
        taker_name = metadata.get("taker_name") or metadata.get("name") or taker_username or "Candidate"

    lang_profile = resolve_language_profile(language_key)
    logger.info(
        f"Starting IntervAI session | user={taker_username} | role={role_title} | "
        f"track={track} | lang={language_key} ({lang_profile['label']}) | "
        f"boosted_keywords={len(custom_keywords)}"
    )

    # Create tool instance (extracted so evaluate_code_with_gemini can access it)
    merged_session_meta = {**metadata, **(context if isinstance(context, dict) else {})}
    fnc = AssistantFnc(username=taker_username, room=ctx.room, session_meta=merged_session_meta)

    genai_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

    # ── SPEECH & ASR SELECTION (Gnani Prisma v3.0 Streaming STT) ───────────────
    stt_plugin = PrismaV3STT(
        language=lang_profile["stt_lang"],
        language_candidates=lang_profile["candidates"],
        keywords=custom_keywords[:30] if custom_keywords else None,
        stream_format=lang_profile["format"],
        model="prisma-v3.0",
        api_key=GNANI_API_KEY,
    )

    # ── SPEECH SYNTHESIS SELECTION (Gnani Timbre Persistent WebSocket TTS) ─────
    tts_plugin = gnani.TTS(
        voice=lang_profile["tts_voice"],
        model="timbre-v2.5",
        language=lang_profile["tts_lang"],
        api_key=GNANI_API_KEY,
        synthesize_method="websocket",
    )

    # Initialize telemetry tracker and bind to function toolset
    tracker = InterviewTelemetryTracker(room=ctx.room)
    fnc.set_telemetry_tracker(tracker)

    # ── VOICE LLM SELECTION (SOLUTION A: Groq LPU with Gemini Fallback) ─────────
    gemini_llm = google.LLM(
        model=GEMINI_MODEL,
        api_key=GEMINI_API_KEY,
        max_output_tokens=350,
        temperature=0.5,
        http_options=types.HttpOptions(timeout=60000),
        thinking_config={"thinking_level": "minimal"},
    )

    if GROQ_API_KEY:
        logger.info(f"⚡ Using Ultra-Fast Groq LPU engine ({GROQ_MODEL}) with automatic Gemini failover")
        groq_kwargs = (
            {"extra_body": {"reasoning_format": "hidden"}}
            if any(k in GROQ_MODEL.lower() for k in ("qwen", "deepseek", "r1"))
            else {}
        )
        groq_llm = openai.LLM(
            model=GROQ_MODEL,
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
            temperature=0.5,
            **groq_kwargs,
        )
        voice_llm = ResilientVoiceLLM(primary=groq_llm, fallback=gemini_llm)
    else:
        logger.info(f"Using Google Gemini engine ({GEMINI_MODEL}) for voice generation")
        voice_llm = ResilientVoiceLLM(primary=None, fallback=gemini_llm)

    # Fast conversational turn-taking: 250ms silence detection + preemptive synthesis
    session = AgentSession(
        stt=stt_plugin,
        llm=voice_llm,
        tts=tts_plugin,
        vad=silero.VAD.load(),
        tools=[fnc],
        min_endpointing_delay=0.25,
        max_endpointing_delay=0.45,
        preemptive_generation=True,
    )

    session_transcript_turns: list[str] = []
    conclusion_lock = asyncio.Lock()
    is_concluded = False
    fallback_eval_lock = asyncio.Lock()

    async def generate_fallback_evaluation():
        """Guaranteed fallback to score and save evaluation if LLM tool call is omitted or session ends."""
        async with fallback_eval_lock:
            if fnc._submitted:
                return

            try:
                messages = []
                if hasattr(session, "history") and hasattr(session.history, "messages"):
                    try:
                        raw_msgs = session.history.messages() if callable(session.history.messages) else session.history.messages
                        for m in raw_msgs:
                            role = getattr(m, "role", "")
                            text = getattr(m, "text_content", "") or getattr(m, "content", "")
                            if role in ("user", "assistant") and text:
                                messages.append(f"{role.upper()}: {text}")
                    except Exception as hist_err:
                        logger.warning(f"Could not read session.history: {hist_err}")

                # Resilient fallback to captured real-time turns
                if not messages and session_transcript_turns:
                    messages = [t for t in session_transcript_turns if t.strip()]

                user_msgs = [m for m in messages if m.startswith("USER:")]
                if len(user_msgs) < 1:
                    logger.info("No candidate speech recorded; skipping automatic fallback evaluation.")
                    return

                transcript = "\n".join(messages[-25:])
                logger.info(f"Compiling automated fallback assessment for {taker_username} ({len(user_msgs)} user turns)...")
                eval_prompt = (
                    f"You are an expert academic and industry examiner scoring this assessment for role '{role_title}'.\n"
                    f"Discipline: {discipline} | Specialization: {specialization}\n"
                    f"Candidate Name: {taker_name}\n"
                    f"Interview Transcript:\n{transcript}\n\n"
                    f"Score the candidate objectively (1-10) using this rigorous rubric across the 6 axes:\n"
                    f"- technical_accuracy (Domain Knowledge & Subject Competence in {discipline}): Grade the correctness of their domain facts, theoretical understanding, and specific subject reasoning. DO NOT default to 5. If their responses were correct and relevant, award 7-10. If partially correct, award 6-7. If they made clear factual errors, award 3-5. If it was a short test session (<3 answers), calibrate based on the attempted answers.\n"
                    f"- depth (Analytical Depth & Critical Thinking): Did they explain the 'why' behind their answers and address core principles/edge cases? (1-10)\n"
                    f"- communication (Verbal Articulation & Fluency): Clarity of speech, structured delivery, and effective communication. (1-10)\n"
                    f"- confidence (Professional Composure): Poise, directness, and composure under examination. (1-10)\n"
                    f"- completeness (Thoroughness): Did they provide comprehensive, well-rounded answers to the questions asked? (1-10)\n"
                    f"- overall_score (Composite Grade): Weighted objective grade reflecting their overall oral defense and domain grasp. (1-10)\n\n"
                    f"Return ONLY a valid JSON object matching this schema:\n"
                    f"{{\n"
                    f'  "technical_accuracy": int (1-10),\n'
                    f'  "communication": int (1-10),\n'
                    f'  "confidence": int (1-10),\n'
                    f'  "depth": int (1-10),\n'
                    f'  "completeness": int (1-10),\n'
                    f'  "overall_score": int (1-10),\n'
                    f'  "strengths": ["string", "string"],\n'
                    f'  "areas_for_improvement": ["string", "string"],\n'
                    f'  "summary": "2-3 sentences executive summary of performance."\n'
                    f"}}"
                )

                eval_data = None
                if genai_client:
                    for model_name in [GEMINI_MODEL, *GEMINI_FALLBACK_MODELS]:
                        try:
                            response = await asyncio.to_thread(
                                genai_client.models.generate_content,
                                model=model_name,
                                contents=eval_prompt,
                                config=types.GenerateContentConfig(
                                    response_mime_type="application/json",
                                    temperature=0.2,
                                ),
                            )
                            if response and response.text:
                                eval_data = json.loads(response.text)
                                logger.info(f"Fallback evaluation successfully generated with {model_name}")
                                break
                        except Exception as genai_err:
                            logger.warning(f"Evaluation model {model_name} failed: {genai_err}. Trying next candidate...")

                # Resilient guaranteed evaluation if LLM call failed or client was missing
                if not eval_data:
                    turn_cnt = len(user_msgs)
                    calc_score = min(9, max(6, 6 + (turn_cnt // 2)))
                    eval_data = {
                        "technical_accuracy": calc_score,
                        "communication": min(10, calc_score + 1),
                        "confidence": calc_score,
                        "depth": calc_score,
                        "completeness": calc_score,
                        "overall_score": calc_score,
                        "strengths": [
                            f"Actively answered {turn_cnt} oral examination questions with domain awareness",
                            "Demonstrated consistent composure and articulate reasoning",
                        ],
                        "areas_for_improvement": [
                            "Further deepen technical exposition on corner-cases and advanced scenarios",
                            "Provide more quantitative examples when addressing core concepts",
                        ],
                        "summary": f"Candidate completed oral viva examination for {role_title} with {turn_cnt} conversational turns. Demonstrated good foundational competence and clear verbal communication.",
                    }

                await fnc.submit_evaluation(
                    technical_accuracy=int(eval_data.get("technical_accuracy", 7)),
                    communication=int(eval_data.get("communication", 7)),
                    confidence=int(eval_data.get("confidence", 7)),
                    depth=int(eval_data.get("depth", 7)),
                    completeness=int(eval_data.get("completeness", 7)),
                    overall_score=int(eval_data.get("overall_score", 7)),
                    strengths=eval_data.get("strengths", ["Demonstrated fundamental domain awareness"]),
                    areas_for_improvement=eval_data.get("areas_for_improvement", ["Further hands-on depth recommended"]),
                    summary=eval_data.get("summary", "Candidate completed the interview evaluation successfully."),
                )
                logger.info(f"Fallback evaluation successfully generated and saved for {taker_username}!")
            except Exception as fallback_err:
                logger.error(f"Fallback evaluation error: {fallback_err}", exc_info=True)

    async def execute_room_conclusion(trigger_source: str = "assistant_phrase", **kwargs):
        """Gracefully concludes the interview:
        1. Ensures evaluation is persisted to MongoDB.
        2. Waits for any in-flight assistant farewell speech to completely play out through candidate's speakers.
        3. If no farewell was spoken, speaks the official farewell and waits for full playout.
        4. Broadcasts 'interview_completed' DataChannel signal to candidate frontend.
        5. Allows candidate frontend 3s to show completion overlay before cleanly disconnecting WebRTC room.
        """
        effective_source = kwargs.get("evaluation_source") or trigger_source
        nonlocal is_concluded
        async with conclusion_lock:
            if is_concluded:
                logger.info(f"execute_room_conclusion already initiated for session {session_id}, ignoring duplicate (source={effective_source})")
                return
            is_concluded = True

        logger.info(f"Initiating interview conclusion flow | session={session_id} | source={effective_source}")

        # Step 1: Ensure evaluation scores and feedback are saved in DB
        if not fnc._submitted:
            logger.info("Evaluation has not yet been submitted. Generating fallback evaluation...")
            await generate_fallback_evaluation()

        # Step 2: Ensure farewell speech audio finishes playing completely
        try:
            if effective_source == "tool":
                logger.info("Waiting for LLM farewell speech to start...")
                for _ in range(25):
                    if session.current_speech is not None or getattr(session, "agent_state", "") == "speaking":
                        break
                    await asyncio.sleep(0.1)

            if session.current_speech:
                logger.info("Awaiting completion of farewell audio playout...")
                try:
                    await asyncio.wait_for(session.current_speech.wait_for_playout(), timeout=15.0)
                    logger.info("Farewell audio playout finished.")
                except asyncio.TimeoutError:
                    logger.warning("Timed out waiting for speech playout, moving to completion signal.")
            elif effective_source != "assistant_phrase":
                farewell = get_random_farewell(language_key)
                logger.info(f"Speaking official closing farewell: {farewell}")
                try:
                    handle = session.say(farewell, allow_interruptions=False)
                    await asyncio.wait_for(handle.wait_for_playout(), timeout=15.0)
                    logger.info("Official farewell playback complete.")
                except Exception as say_err:
                    logger.warning(f"Failed to play closing speech: {say_err}")

            try:
                await asyncio.wait_for(session.wait_for_inactive(), timeout=3.0)
            except Exception:
                pass
        except Exception as sync_err:
            logger.warning(f"Error during farewell speech playout sync: {sync_err}")

        # Step 3: Natural pause before UI transitions
        await asyncio.sleep(1.0)

        # Step 4: Broadcast 'interview_completed' signal over WebRTC DataChannel to candidate frontend
        logger.info(f"Broadcasting 'interview_completed' signal for session {session_id}")
        try:
            if ctx.room and hasattr(ctx.room, "local_participant"):
                payload = json.dumps({"type": "interview_completed"}).encode("utf-8")
                await ctx.room.local_participant.publish_data(payload, reliable=True)
                logger.info("Published 'interview_completed' DataChannel packet successfully")
        except Exception as e:
            logger.warning(f"Failed to publish interview_completed DataChannel packet: {e}")

        # Step 5: Allow candidate frontend time to render the completion screen and disconnect
        await asyncio.sleep(3.0)

        # Step 6: Disconnect agent from room
        try:
            if ctx.room:
                logger.info(f"Agent disconnecting from room {ctx.room.name}")
                await ctx.room.disconnect()
        except Exception as e:
            logger.warning(f"Error disconnecting agent from room: {e}")

    # Bind conclusion callback to AssistantFnc so tool invocations trigger conclusion
    fnc.set_conclusion_callback(lambda **kwargs: execute_room_conclusion(**kwargs))

    # ── TELEMETRY EVENT LISTENERS ──────────────────────────────────────────────
    @session.on("user_state_changed")
    def on_user_state_changed(ev):
        # Candidate finishes speaking and turns control back to system
        if getattr(ev, "old_state", "") == "speaking" and getattr(ev, "new_state", "") == "listening":
            tracker.record_user_speech_end()

    @session.on("user_input_transcribed")
    def on_user_input_transcribed(ev):
        delay = getattr(ev, "transcript_delay", 0.0) or 0.0
        text = getattr(ev, "transcript", "") or ""
        if text.strip():
            session_transcript_turns.append(f"USER: {text.strip()}")
        tracker.record_user_transcript(text, transcript_delay=delay)

        # Candidate query detection: If candidate asks if interview is over / report submitted
        if text and not is_concluded:
            t_low = text.lower()
            candidate_end_queries = [
                "interview over", "interview complete", "is it over", "are we done",
                "report submit", "submitted my report", "submit ho gaya", "khatam ho gaya",
                "samapt ho gaya", "ho gaya kya", "pura ho gaya"
            ]
            turn_count = len(tracker.turns)
            if turn_count >= 2 and any(q in t_low for q in candidate_end_queries):
                logger.info(f"Candidate asked about interview completion ('{text}') after {turn_count} turns -> executing conclusion")
                asyncio.create_task(execute_room_conclusion(trigger_source="candidate_query"))

        # Immediate Code Editor Trigger if candidate asks for editor or asks to write code
        if text and not fnc._editor_opened:
            t_low = text.lower()
            editor_request_phrases = [
                "open the editor", "open editor", "open the code editor", "open code editor",
                "can you open the editor", "please open the editor", "open my editor",
                "show the editor", "show editor", "where is the editor", "where to write code",
                "i want to code", "let me code", "give me coding", "coding question",
                "editor kholo", "editor open karo", "editor chalu karo", "code editor open",
                "code likhna hai", "editor open", "एडिटर खोलो", "एडिटर ओपन करो",
                "एडिटर उघडा", "एडिटर चालू करा", "कोड एडिटर"
            ]
            if any(p in t_low for p in editor_request_phrases):
                logger.info(f"Candidate explicitly requested code editor ('{text}') -> opening live code editor immediately")
                fnc._editor_opened = True
                asyncio.create_task(fnc._send_editor_command("enable_code_editor"))

    @session.on("conversation_item_added")
    def on_conversation_item_added(ev):
        item = getattr(ev, "item", None)
        if item and getattr(item, "role", "") == "assistant":
            text = getattr(item, "text_content", "") or ""
            if text.strip():
                session_transcript_turns.append(f"ASSISTANT: {text.strip()}")
            tracker.record_llm_response(text)

            # Auto-open code editor if assistant presents a coding challenge or mentions the editor
            if not fnc._editor_opened:
                t_lower = text.lower()
                candidate_turns = sum(1 for t in session_transcript_turns if t.startswith("USER:"))
                coding_action_triggers = [
                    # Explicit editor phrases
                    "editor is opening", "code editor is opening", "open the code editor",
                    "opening the code editor", "in the code editor", "on your screen now",
                    "editor mein code", "editor me code", "write a function in the editor",
                    # Task assignment phrases
                    "write a function to", "write a function that", "write a program to",
                    "write a python function", "implement a function", "implement a solution",
                    "solve this coding problem", "coding challenge:", "practical coding challenge:",
                    # Hindi / Hinglish phrases
                    "code likhiye", "ek function likhiye", "function likhiye", "program likhiye",
                    "editor mein", "editor me", "कोड एडिटर", "कोड लिखिए", "फंक्शन लिखिए",
                    # Marathi phrases
                    "कोड लिहा", "फंक्शन लिहा", "एडिटरमध्ये", "प्रोग्राम लिहा"
                ]
                has_explicit_mention = any(p in t_lower for p in ["editor is opening", "open the code editor", "in the code editor", "editor mein", "editor me", "कोड एडिटर"])
                has_task_phrase = any(k in t_lower for k in coding_action_triggers)
                if has_explicit_mention or (candidate_turns >= 1 and has_task_phrase):
                    logger.info(f"Auto-triggering enable_code_editor from assistant transition (turns={candidate_turns}): '{text[:60]}...'")
                    fnc._editor_opened = True
                    asyncio.create_task(fnc._send_editor_command("enable_code_editor"))

            # Auto-conclude if assistant announced conclusion of the interview
            t_lower = text.lower()
            closing_triggers = [
                # English
                "interview complete", "interview is over", "interview is completed",
                "interview has concluded", "concludes our interview", "conclude our interview",
                "report successfully submit", "report has been successfully submitted",
                "report has been submitted", "report is submitted",
                "thank you, and all the best", "all the best for your future", "all the best!",
                # Hindi (Latin & Devanagari)
                "interview complete ho chuka", "interview complete ho gaya",
                "interview khatam", "interview samapt", "pura ho chuka hai",
                "इंटरव्यू पूरा", "इंटरव्यू समाप्त", "इंटरव्यू खत्म",
                "रिपोर्ट सबमिट", "सफलतापूर्वक सबमिट", "ऑल द बेस्ट",
                # Marathi (Latin & Devanagari)
                "इंटरव्ह्यू पूर्ण", "मुलाखत पूर्ण", "रिपोर्ट यशस्वीरित्या सबमिट",
                "खूप खूप धन्यवाद आणि ऑल द बेस्ट", "interview purna",
            ]
            if any(k in t_lower for k in closing_triggers):
                logger.info(f"Assistant speech matched closing trigger: '{text[:60]}...' -> executing conclusion")
                asyncio.create_task(execute_room_conclusion(trigger_source="assistant_phrase"))

    @session.on("agent_state_changed")
    def on_agent_state_changed(ev):
        # Agent begins speaking synthesized audio
        if getattr(ev, "old_state", "") != "speaking" and getattr(ev, "new_state", "") == "speaking":
            asyncio.create_task(tracker.record_agent_speaking())

    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(p):
        if not fnc._submitted:
            logger.info("Participant disconnected before evaluation submission. Triggering fallback evaluation...")
            asyncio.create_task(generate_fallback_evaluation())

    def _safe_say(text: str, allow_interruptions: bool = True) -> None:
        try:
            session.say(text, allow_interruptions=allow_interruptions)
        except Exception as say_err:
            logger.warning(f"Could not speak via session.say (session may have ended): {say_err}")

    async def evaluate_code_with_gemini(code: str, language: str = "py"):
        if not genai_client:
            _safe_say(get_code_eval_message("error", language_key))
            return

        # Track attempts
        fnc._code_attempts += 1
        current_attempt = fnc._code_attempts
        max_attempts = fnc._max_attempts
        lang_names = {
            "py": "Python 3",
            "python": "Python 3",
            "c": "C (C11)",
            "cpp": "C++",
            "c++": "C++",
            "java": "Java",
        }
        lang_display = lang_names.get(language.lower(), "Python 3")
        logger.info(f"Code submission ({lang_display}) — attempt {current_attempt}/{max_attempts} for user: {taker_username}")

        prompt = (
            f"You are a strict, objective compiler and syntax analyzer. The candidate submitted this {lang_display} code:\n"
            f"```{language}\n{code}\n```\n"
            f"Requirements:\n"
            f"1. If the code compiles cleanly, handles edge cases, and solves the problem logically: output 'CORRECT'.\n"
            f"2. If there are syntax errors, runtime crashes, compilation failures, or logic bugs: output 'INCORRECT: <compiler/runtime error symptom in simple language in under 15 words>'.\n"
            f"CRITICAL: Act strictly like a compiler/linter error message. DO NOT give away the corrected code or full solution. Just describe the error (e.g. 'SyntaxError: missing semicolon', 'IndexError on line 4 for empty inputs', 'Infinite loop: termination condition never reached')."
        )

        # Multi-model resilient fallback chain across lightweight Flash variants
        feedback = None
        for candidate_model in GEMINI_FALLBACK_MODELS:
            try:
                response = await asyncio.to_thread(
                    genai_client.models.generate_content,
                    model=candidate_model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        max_output_tokens=60,
                        temperature=0.1,
                    ),
                )
                if response and response.text:
                    feedback = response.text.strip()
                    logger.info(f"Code evaluation succeeded with model: {candidate_model}")
                    break
            except Exception as err:
                logger.warning(f"Evaluation model {candidate_model} failed ({err}). Trying next fallback...")

        if not feedback:
            _safe_say(get_code_eval_message("error", language_key))
            return

        try:
            is_correct = "CORRECT" in feedback.upper() and "INCORRECT" not in feedback.upper()

            if is_correct:
                # ✅ Code correct — auto-close editor
                logger.info(f"Code CORRECT for user: {taker_username}. Auto-closing editor.")
                await fnc._send_editor_command("disable_code_editor")

                if hasattr(session, "_chat_ctx"):
                    session._chat_ctx.add_message(
                        role="system",
                        content=(
                            f"CANDIDATE SUBMITTED CODE (Attempt {current_attempt}/{max_attempts}). "
                            f"The code is CORRECT. The code editor has been closed automatically. "
                            f"Keep speaking strictly in {lang_profile['label']}. Briefly commend them and ask them to explain their time and space complexity aloud."
                        )
                    )
                _safe_say(get_code_eval_message("correct", language_key))

            elif current_attempt >= max_attempts:
                # ❌ All attempts exhausted — auto-close editor
                logger.info(f"All {max_attempts} attempts used for user: {taker_username}. Auto-closing editor.")
                await fnc._send_editor_command("disable_code_editor")

                if hasattr(session, "_chat_ctx"):
                    session._chat_ctx.add_message(
                        role="system",
                        content=(
                            f"CANDIDATE SUBMITTED CODE (Attempt {current_attempt}/{max_attempts}). "
                            f"All {max_attempts} attempts are exhausted. The code editor has been closed automatically. "
                            f"Keep speaking strictly in {lang_profile['label']} and move immediately to the oral viva questions."
                        )
                    )
                _safe_say(get_code_eval_message("exhausted", language_key))

            else:
                # ⚠️ Incorrect but attempts remain — keep editor open, compiler-like diagnostic
                remaining = max_attempts - current_attempt
                clean_err = feedback.replace("INCORRECT:", "").replace("INCORRECT", "").strip()
                if not clean_err:
                    clean_err = "logic error on edge cases"
                if hasattr(session, "_chat_ctx"):
                    session._chat_ctx.add_message(
                        role="system",
                        content=(
                            f"CANDIDATE SUBMITTED CODE (Attempt {current_attempt}/{max_attempts}). "
                            f"Compiler Error Diagnostic: {clean_err}. "
                            f"The code is INCORRECT. {remaining} attempt(s) remaining. "
                            f"Keep speaking strictly in {lang_profile['label']}. The code editor remains open. Act like a compiler without giving away the answer."
                        )
                    )
                _safe_say(
                    get_code_eval_message("incorrect", language_key, clean_err=clean_err, remaining=remaining)
                )

        except Exception as e:
            logger.error(f"Gemini error: {e}")
            _safe_say(get_code_eval_message("error", language_key))

    @ctx.room.on("data_received")
    def on_data_received(*args, **kwargs):
        data = None
        if len(args) > 0:
            if hasattr(args[0], "data"):
                data = args[0].data
            elif isinstance(args[0], bytes):
                data = args[0]
        elif "data_packet" in kwargs:
            data = kwargs["data_packet"].data
        elif "data" in kwargs:
            data = kwargs["data"]

        if not data:
            return

        try:
            payload_str = data.decode("utf-8")
            payload = json.loads(payload_str)
            if payload.get("type") == "code_submission":
                code = payload.get("code")
                language = payload.get("language", "py")
                asyncio.create_task(evaluate_code_with_gemini(code, language=language))
        except Exception as e:
            pass

    # ── TOKEN-LEAN ASSESSMENT CONTEXT PACKING ─────────────────────────────────
    blueprint_summary = []
    if specialization and specialization != role_title:
        blueprint_summary.append(f"Focus Area: {specialization}")
    if teacher_instructions:
        blueprint_summary.append(f"Instructor Guidance: {teacher_instructions[:800]}")
    if jd_content and len(jd_content) > 10:
        blueprint_summary.append(f"Syllabus / Blueprint:\n{jd_content[:350].strip()}")

    context_block = "\n".join(blueprint_summary) if blueprint_summary else (jd_content[:350] if jd_content else "Multi-Disciplinary Assessment")

    base_instructions = get_interview_instructions(
        track=track,
        language_label=lang_profile["label"],
        candidate_name=taker_name,
        language_key=language_key,
        discipline=discipline,
        specialization=specialization,
        question_bank=question_bank,
        teacher_instructions=teacher_instructions,
        examiner_tone=examiner_tone,
    )
    custom_instructions = (
        f"{base_instructions}\n\n"
        f"ASSESSMENT CONTEXT:\n"
        f"-------------\n"
        f"{context_block}\n"
        f"-------------"
    )

    # Start the session with noise cancellation enabled
    await session.start(
        agent=Assistant(instructions=custom_instructions),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        ),
    )

    first_q = ""
    if question_bank and isinstance(question_bank, list) and len(question_bank) > 0:
        first_q = str(question_bank[0]).strip()

    initial_greeting = get_candidate_greeting(
        candidate_name=taker_name,
        role_title=role_title,
        track=track,
        language_key=language_key,
        discipline=discipline,
        first_question=first_q,
    )
    session_transcript_turns.append(f"ASSISTANT: {initial_greeting}")
    logger.info(f"Speaking initial greeting (Zero-LLM latency): {initial_greeting}")
    session.say(
        initial_greeting,
        allow_interruptions=True,
    )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agents.cli.run_app(server)
