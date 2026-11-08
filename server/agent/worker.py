import logging
import os
import sys
from pathlib import Path
import json
import asyncio

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from google import genai
from google.genai import types
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, JobContext, room_io
from livekit.plugins import noise_cancellation, silero, google, gnani, deepgram, cartesia

from server.config import GEMINI_API_KEY, GNANI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODELS
from server.agent.gnani_prisma import PrismaV3STT, resolve_language_profile
from server.agent.prompts import get_interview_instructions, get_random_greeting
from server.agent.tools import AssistantFnc
from server.services.jd_parser import get_interview_session_context, load_jd

logger = logging.getLogger(__name__)

AGENT_NAME = "intervai-agent"


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

    # 1. Parse Metadata passed in from the frontend JWT token
    metadata = {}
    if ctx.room.metadata:
        try:
            metadata = json.loads(ctx.room.metadata)
        except Exception as e:
            logger.warning(f"Failed to parse room metadata: {e}")

    username = participant.identity
    if "-" in ctx.room.name and len(ctx.room.name.split("-", 1)[1]) > 0:
        username = ctx.room.name.split("-", 1)[1]

    session_id = metadata.get("session_id", "")
    language_key = metadata.get("language", "hinglish")
    track = metadata.get("track", "tech")

    # 2. Dynamically load the exact Interview Session context from MongoDB
    try:
        context = await get_interview_session_context(
            session_id=session_id,
            username=username,
            track=track,
            language=language_key,
        )
        jd_content = context["jd_text"]
        custom_keywords = metadata.get("keywords") or context.get("keywords") or []
        track = context.get("track", track)
        language_key = context.get("language", language_key)
        role_title = context.get("role_title", "Interview Role")
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

    lang_profile = resolve_language_profile(language_key)
    logger.info(
        f"Starting IntervAI session | user={username} | role={role_title} | "
        f"track={track} | lang={language_key} ({lang_profile['label']}) | "
        f"boosted_keywords={len(custom_keywords)}"
    )

    # Create tool instance (extracted so evaluate_code_with_gemini can access it)
    merged_session_meta = {**metadata, **(context if isinstance(context, dict) else {})}
    fnc = AssistantFnc(username=username, room=ctx.room, session_meta=merged_session_meta)

    genai_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

    # Configure the speech pipeline: Gnani Prisma v3.0 STT -> Gemini LLM -> Gnani Timbre TTS
    if GNANI_API_KEY:
        stt_plugin = PrismaV3STT(
            language=lang_profile["stt_lang"],
            language_candidates=lang_profile["candidates"],
            keywords=custom_keywords,
            stream_format=lang_profile["format"],
            model="prisma-v3.0",
            api_key=GNANI_API_KEY,
        )
        tts_plugin = gnani.TTS(
            voice=lang_profile["tts_voice"],
            model="timbre-v2.5",
            language=lang_profile["tts_lang"],
            api_key=GNANI_API_KEY,
        )
    else:
        stt_plugin = deepgram.STT()
        tts_plugin = cartesia.TTS()

    # ── TOKEN & LATENCY OPTIMIZED GEMINI CONFIGURATION ──────────────────────────
    # 1. Primary: 'gemini-3.5-flash-lite' — Ultra-light, 0.76s latency, high rate limits,
    #    zero reasoning token bloat, fully supported for all new API keys.
    # 2. max_output_tokens=180 caps conversational speech to 1-2 punchy sentences.
    session = AgentSession(
        stt=stt_plugin,
        llm=google.LLM(
            model=GEMINI_MODEL,
            api_key=GEMINI_API_KEY,
            max_output_tokens=180,
            temperature=0.6,
        ),
        tts=tts_plugin,
        vad=silero.VAD.load(),
        tools=[fnc],
        min_endpointing_delay=0.3,
        max_endpointing_delay=0.6,
        preemptive_generation=True,
    )

    async def evaluate_code_with_gemini(code: str):
        if not genai_client:
            session.say("I received your code, but my evaluation module is not configured.", allow_interruptions=True)
            return

        # Track attempts
        fnc._code_attempts += 1
        current_attempt = fnc._code_attempts
        max_attempts = fnc._max_attempts
        logger.info(f"Code submission — attempt {current_attempt}/{max_attempts} for user: {username}")

        prompt = (
            f"The candidate has submitted this code:\n```\n{code}\n```\n"
            f"Provide a very brief evaluation. If the logic is sound and code is correct, "
            f"output 'CORRECT'. If incorrect, output 'INCORRECT' followed by a 1-sentence hint on what to fix."
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
                    feedback = response.text
                    logger.info(f"Code evaluation succeeded with model: {candidate_model}")
                    break
            except Exception as err:
                logger.warning(f"Evaluation model {candidate_model} failed ({err}). Trying next fallback...")

        if not feedback:
            session.say("I received your code, but I encountered an error evaluating it. Let's move on.", allow_interruptions=True)
            return

        try:
            is_correct = "CORRECT" in feedback.upper() and "INCORRECT" not in feedback.upper()

            if is_correct:
                # ✅ Code correct — auto-close editor
                logger.info(f"Code CORRECT for user: {username}. Auto-closing editor.")
                await fnc._send_editor_command("disable_code_editor")

                if hasattr(session, "_chat_ctx"):
                    session._chat_ctx.add_message(
                        role="system",
                        content=(
                            f"CANDIDATE SUBMITTED CODE (Attempt {current_attempt}/{max_attempts}). "
                            f"Code Evaluation Report: {feedback}. "
                            f"The code is CORRECT. The code editor has been closed automatically. "
                            f"Briefly acknowledge and ask the candidate to explain their logic and complexity orally."
                        )
                    )
                session.say("I've evaluated your code and it looks correct! Well done.", allow_interruptions=True)

            elif current_attempt >= max_attempts:
                # ❌ All attempts exhausted — auto-close editor
                logger.info(f"All {max_attempts} attempts used for user: {username}. Auto-closing editor.")
                await fnc._send_editor_command("disable_code_editor")

                if hasattr(session, "_chat_ctx"):
                    session._chat_ctx.add_message(
                        role="system",
                        content=(
                            f"CANDIDATE SUBMITTED CODE (Attempt {current_attempt}/{max_attempts}). "
                            f"Code Evaluation Report: {feedback}. "
                            f"All {max_attempts} attempts are exhausted. The code editor has been closed automatically. "
                            f"Acknowledge their effort and proceed to the oral viva questions."
                        )
                    )
                session.say("That was your last attempt. Let's move on to the viva questions.", allow_interruptions=True)

            else:
                # ⚠️ Incorrect but attempts remain — keep editor open
                remaining = max_attempts - current_attempt
                if hasattr(session, "_chat_ctx"):
                    session._chat_ctx.add_message(
                        role="system",
                        content=(
                            f"CANDIDATE SUBMITTED CODE (Attempt {current_attempt}/{max_attempts}). "
                            f"Code Evaluation Report: {feedback}. "
                            f"The code is INCORRECT. {remaining} attempt(s) remaining. "
                            f"The code editor remains open. Give a brief hint and let them try again."
                        )
                    )
                session.say(
                    f"I've checked your code. {feedback} You have {remaining} attempt{'s' if remaining > 1 else ''} left.",
                    allow_interruptions=True,
                )

        except Exception as e:
            logger.error(f"Gemini error: {e}")
            session.say("I received your code, but I encountered an error evaluating it. Let's move on.", allow_interruptions=True)

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
                asyncio.create_task(evaluate_code_with_gemini(code))
        except Exception as e:
            pass

    # ── TOKEN OPTIMIZATION: JD Compaction ──────────────────────────────────────
    # Compact excessively long JDs to max 1,500 chars to avoid re-sending thousands
    # of input tokens on every multi-turn conversation step.
    compact_jd = (jd_content[:1500] + "...") if len(jd_content) > 1500 else jd_content

    base_instructions = get_interview_instructions(track=track, language_label=lang_profile["label"])
    custom_instructions = (
        f"{base_instructions}\n\n"
        f"INTERVIEW ROLE: {role_title} (Track: {track.upper()})\n"
        f"JOB DESCRIPTION FOR THIS INTERVIEW:\n"
        f"-------------\n"
        f"{compact_jd}\n"
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

    initial_greeting = get_random_greeting(language_key)
    logger.info(f"Speaking initial greeting (Zero-LLM latency): {initial_greeting}")
    session.say(
        initial_greeting,
        allow_interruptions=True,
    )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agents.cli.run_app(server)
