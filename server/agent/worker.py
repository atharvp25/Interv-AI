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

import google.generativeai as genai
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, JobContext, room_io
from livekit.plugins import noise_cancellation, silero, google, gnani, deepgram, cartesia

from server.config import GEMINI_API_KEY, GNANI_API_KEY
from server.agent.prompts import INTERVIEW_INSTRUCTIONS, get_random_greeting
from server.agent.tools import AssistantFnc
from server.services.jd_parser import load_jd

logger = logging.getLogger(__name__)


# Define your agent's behavior
class Assistant(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(
            instructions=instructions,
        )


server = AgentServer()


# The entrypoint function runs when a participant joins the room
@server.rtc_session()
async def entrypoint(ctx: JobContext):
    
    username = "unknown"
    if ctx.room.name.startswith("interview-"):
        username = ctx.room.name.split("-", 1)[1]

    # Create tool instance (extracted so evaluate_code_with_gemini can access it)
    fnc = AssistantFnc(username=username, room=ctx.room)

    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)

    # Configure the speech pipeline: Gnani Prisma STT -> Gemini LLM -> Gnani Timbre TTS
    stt_plugin = gnani.STT(language="indic-auto", api_key=GNANI_API_KEY) if GNANI_API_KEY else deepgram.STT()
    tts_plugin = gnani.TTS(voice="Nalini", model="timbre-v2.5", language="hi-IN", api_key=GNANI_API_KEY) if GNANI_API_KEY else cartesia.TTS()

    session = AgentSession(
        stt=stt_plugin,                              # Listening via Gnani Prisma (indic-auto)
        llm=google.LLM(),                            # Brain via Gemini directly
        tts=tts_plugin,                              # Speaking via Gnani Timbre (Nalini)
        vad=silero.VAD.load(),                       # Voice activity detection (local)
        tools=[fnc],                                 # Inject Tool Calling
        min_endpointing_delay=0.3,                   # React 300ms after user stops
        max_endpointing_delay=0.6,                   # Upper bound 600ms
        preemptive_generation=True,                  # Start generating while user may still speak
    )

    async def evaluate_code_with_gemini(code: str):
        if not GEMINI_API_KEY:
            session.say("I received your code, but my evaluation module is not configured.", allow_interruptions=True)
            return

        # Track attempts
        fnc._code_attempts += 1
        current_attempt = fnc._code_attempts
        max_attempts = fnc._max_attempts
        logger.info(f"Code submission — attempt {current_attempt}/{max_attempts} for user: {username}")

        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = (
                f"The candidate has submitted this code:\n```\n{code}\n```\n"
                f"Provide a very brief evaluation. If the logic is sound and code is correct, "
                f"output 'CORRECT'. If incorrect, output 'INCORRECT' followed by a 1-sentence hint on what to fix."
            )
            response = await asyncio.to_thread(model.generate_content, prompt)
            feedback = response.text

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
                            f"Briefly acknowledge and move to the next question."
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
                            f"Acknowledge their effort and move on to the next question."
                        )
                    )
                session.say("That was your last attempt. Let's move on to the next part of the interview.", allow_interruptions=True)

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

    # Load the Job Description
    try:
        jd_content = load_jd()
    except Exception as e:
        logger.error(f"Error loading Job Description: {e}")
        jd_content = "Data Science Role (Python, SQL, Machine Learning)"

    custom_instructions = (
        f"{INTERVIEW_INSTRUCTIONS}\n\n"
        f"JOB DESCRIPTION FOR THIS INTERVIEW:\n"
        f"-------------\n"
        f"{jd_content}\n"
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

    initial_greeting = get_random_greeting()
    logger.info(f"Speaking initial greeting (Zero-LLM latency): {initial_greeting}")
    session.say(
        initial_greeting,
        allow_interruptions=True,
    )

    # ── Fallback: auto-open the code editor if the LLM fails to call the tool ──
    async def _auto_open_code_editor_fallback():
        # Wait for the greeting + coding question to be spoken (~15 seconds)
        await asyncio.sleep(15)
        if not fnc._editor_opened:
            logger.info("AUTO-OPENING code editor (LLM did not call the tool — fallback triggered)")
            fnc._editor_opened = True
            fnc._code_attempts = 0
            await fnc._send_editor_command("enable_code_editor")

    asyncio.create_task(_auto_open_code_editor_fallback())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agents.cli.run_app(server)

