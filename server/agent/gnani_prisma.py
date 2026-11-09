"""
Prisma v3.0 WebSocket STT adapter for LiveKit Agents.

Why this exists:
The upstream `livekit-plugins-gnani` package was authored prior to the
Prisma v3.0 release (Oct 28, 2026) and does not send the `x-model: prisma-v3.0`,
`x-language-candidates`, `x-keywords`, or `x-format: codemix` WebSocket headers.
Without `x-model: prisma-v3.0`, Gnani rejects `lang_code: indic-auto`.

This subclass extends `livekit.plugins.gnani.STT` & `SpeechStream` to unlock:
  1. `model="prisma-v3.0"`
  2. Automatic code-switching (`indic-auto` + `language_candidates`)
  3. Domain Keyterm Boosting (`keywords` up to 200 terms from the JD)
  4. `format="codemix"` (keeps English technical words in Latin script and
     Indian language words natural)
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import ssl
import uuid
from typing import Any

import websockets

# Pre-warm cached SSLContext to prevent Windows CryptoAPI blocking asyncio event loop
_orig_create_default_context = ssl.create_default_context
_GLOBAL_CACHED_SSL_CTX = _orig_create_default_context()

def _cached_create_default_context(*args, **kwargs):
    if not args and not kwargs:
        return _GLOBAL_CACHED_SSL_CTX
    return _orig_create_default_context(*args, **kwargs)

ssl.create_default_context = _cached_create_default_context
from livekit.agents import (
    DEFAULT_API_CONNECT_OPTIONS,
    APIConnectionError,
    APIConnectOptions,
    APIStatusError,
    APITimeoutError,
    LanguageCode,
    stt,
    utils,
)
from livekit.agents.types import NOT_GIVEN, NotGivenOr
from livekit.plugins import gnani
from livekit.plugins.gnani.log import logger

# ── COMPATIBILITY SHIM FOR LIVEKIT-AGENTS 1.5.x ──────────────────────────────
# livekit-plugins-gnani's _recv_messages calls self._mark_provider_progress(),
# which does not exist in livekit-agents 1.5.x base classes and causes unrecoverable
# session termination when Gnani emits 'processing', 'vad_start', or 'transcript'.
if hasattr(gnani, "SpeechStream") and not hasattr(gnani.SpeechStream, "_mark_provider_progress"):
    setattr(gnani.SpeechStream, "_mark_provider_progress", lambda self: None)
if hasattr(gnani, "stt") and hasattr(gnani.stt, "SpeechStream") and not hasattr(gnani.stt.SpeechStream, "_mark_provider_progress"):
    setattr(gnani.stt.SpeechStream, "_mark_provider_progress", lambda self: None)


# Supported language configurations across India (10 Indic languages + Hinglish)
SUPPORTED_INTERVIEW_LANGUAGES: dict[str, dict[str, Any]] = {
    "hinglish": {
        "label": "Hinglish (Hindi + English Code-Mixed)",
        "stt_lang": "indic-auto",
        "candidates": ["en-IN", "hi-IN"],
        "tts_lang": "hi-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "hi-IN": {
        "label": "Hindi (हिन्दी)",
        "stt_lang": "indic-auto",
        "candidates": ["hi-IN", "en-IN"],
        "tts_lang": "hi-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "mr-IN": {
        "label": "Marathi + English (मराठी)",
        "stt_lang": "indic-auto",
        "candidates": ["mr-IN", "en-IN"],
        "tts_lang": "mr-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "ta-IN": {
        "label": "Tamil + English (தமிழ்)",
        "stt_lang": "indic-auto",
        "candidates": ["ta-IN", "en-IN"],
        "tts_lang": "ta-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "te-IN": {
        "label": "Telugu + English (తెలుగు)",
        "stt_lang": "indic-auto",
        "candidates": ["te-IN", "en-IN"],
        "tts_lang": "te-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "kn-IN": {
        "label": "Kannada + English (ಕನ್ನಡ)",
        "stt_lang": "indic-auto",
        "candidates": ["kn-IN", "en-IN"],
        "tts_lang": "kn-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "bn-IN": {
        "label": "Bengali + English (বাংলা)",
        "stt_lang": "indic-auto",
        "candidates": ["bn-IN", "en-IN"],
        "tts_lang": "bn-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "gu-IN": {
        "label": "Gujarati + English (ગુજરાતી)",
        "stt_lang": "indic-auto",
        "candidates": ["gu-IN", "en-IN"],
        "tts_lang": "gu-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "pa-IN": {
        "label": "Punjabi + English (ਪੰਜਾਬੀ)",
        "stt_lang": "indic-auto",
        "candidates": ["pa-IN", "en-IN"],
        "tts_lang": "pa-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "ml-IN": {
        "label": "Malayalam + English (മലയാളം)",
        "stt_lang": "indic-auto",
        "candidates": ["ml-IN", "en-IN"],
        "tts_lang": "ml-IN",
        "tts_voice": "Nalini",
        "format": "codemix",
    },
    "en-IN": {
        "label": "Indian English",
        "stt_lang": "en-IN",
        "candidates": None,
        "tts_lang": "en-IN",
        "tts_voice": "Nalini",
        "format": "transcribe",
    },
}


def resolve_language_profile(lang_key: str | None) -> dict[str, Any]:
    """Return the STT/TTS configuration profile for a requested language key."""
    if not lang_key:
        return SUPPORTED_INTERVIEW_LANGUAGES["hinglish"]
    return SUPPORTED_INTERVIEW_LANGUAGES.get(
        lang_key, SUPPORTED_INTERVIEW_LANGUAGES["hinglish"]
    )


class PrismaV3SpeechStream(gnani.SpeechStream):
    """WebSocket SpeechStream that injects Prisma v3.0 headers."""

    def __init__(
        self,
        *,
        stt_instance: PrismaV3STT,
        opts: Any,
        conn_options: APIConnectOptions,
        model: str = "prisma-v3.0",
        language_candidates: list[str] | None = None,
        keywords: list[str] | None = None,
        stream_format: str = "codemix",
    ) -> None:
        super().__init__(stt=stt_instance, opts=opts, conn_options=conn_options)
        self._prisma_model = model
        self._language_candidates = language_candidates
        self._keywords = keywords[:200] if keywords else None
        self._stream_format = stream_format

    def _mark_provider_progress(self) -> None:
        """Compatibility no-op for livekit-plugins-gnani progress reporting."""
        pass

    async def _recv_messages(self, ws: Any) -> None:
        try:
            async for msg in ws:
                if isinstance(msg, bytes):
                    continue

                data = json.loads(msg)
                msg_type = data.get("type", "")

                if msg_type in ("transcript", "final"):
                    self._mark_provider_progress()
                    text = data.get("text", "")
                    if not text:
                        continue

                    self._event_ch.send_nowait(
                        stt.SpeechEvent(
                            type=stt.SpeechEventType.FINAL_TRANSCRIPT,
                            request_id=data.get("segment_id", ""),
                            alternatives=[
                                stt.SpeechData(
                                    language=LanguageCode(self._opts.language),
                                    text=text,
                                    confidence=1.0,
                                )
                            ],
                        )
                    )

                elif msg_type in ("partial", "interim", "hypothesis"):
                    self._mark_provider_progress()
                    text = data.get("text", "")
                    if text:
                        self._event_ch.send_nowait(
                            stt.SpeechEvent(
                                type=stt.SpeechEventType.INTERIM_TRANSCRIPT,
                                alternatives=[
                                    stt.SpeechData(
                                        language=LanguageCode(self._opts.language),
                                        text=text,
                                        confidence=0.8,
                                    )
                                ],
                            )
                        )

                elif msg_type in ("speech_start", "vad_start"):
                    self._mark_provider_progress()
                    self._event_ch.send_nowait(
                        stt.SpeechEvent(
                            type=stt.SpeechEventType.START_OF_SPEECH,
                        )
                    )

                elif msg_type in ("speech_end", "vad_end"):
                    self._mark_provider_progress()
                    self._event_ch.send_nowait(
                        stt.SpeechEvent(
                            type=stt.SpeechEventType.END_OF_SPEECH,
                        )
                    )

                elif msg_type == "processing":
                    self._mark_provider_progress()

                elif msg_type == "error":
                    error_msg = data.get("message", "Unknown error")
                    err_lower = error_msg.lower()
                    # When candidate is typing code silently for 60s, Gnani closes the stream with:
                    # "Session closed: no speech segment received for 60 seconds."
                    # Treat this as a normal idle cycle and reconnect transparently without killing AgentSession.
                    if "no speech segment" in err_lower or "session closed" in err_lower or "timeout" in err_lower:
                        logger.info(f"Gnani STT idle window reached ({error_msg}) — cycling WebSocket seamlessly.")
                        return

                    logger.error(f"Gnani STT stream error: {error_msg}")
                    raise APIStatusError(
                        message=f"Gnani STT stream error: {error_msg}",
                        status_code=500,
                        body=error_msg,
                    )

        except asyncio.CancelledError:
            raise
        except websockets.exceptions.ConnectionClosed:
            # Socket closed (e.g. after 60s silence); return cleanly so _run loop reconnects if input is still open
            return
        except (APIStatusError, APIConnectionError, APITimeoutError):
            raise
        except Exception as e:
            raise APIConnectionError(f"Error receiving Gnani STT messages: {e}") from e

    async def _run(self) -> None:
        ws_url = self._build_ws_url()

        while not self._input_ch.closed:
            headers: dict[str, str] = {
                "x-api-key-id": self._opts.api_key,
                "lang_code": self._opts.language,
                "x-sample-rate": str(self._opts.sample_rate),
                "x-api-request-id": f"req_{uuid.uuid4().hex[:12]}",
            }
            if self._prisma_model:
                headers["x-model"] = self._prisma_model
            if self._language_candidates and self._opts.language == "indic-auto":
                headers["x-language-candidates"] = ",".join(self._language_candidates)
            if self._keywords:
                headers["x-keywords"] = json.dumps(self._keywords)
            if self._stream_format:
                headers["x-format"] = self._stream_format
            if self._opts.itn_native_numerals:
                headers["x-itn-native-numerals"] = "true"

            try:
                async with websockets.connect(
                    ws_url,
                    additional_headers=headers,
                    ssl=_GLOBAL_CACHED_SSL_CTX,
                    ping_interval=20,
                    ping_timeout=20,
                    close_timeout=10,
                ) as ws:
                    connected_msg = await asyncio.wait_for(ws.recv(), timeout=10)
                    connected_data = json.loads(connected_msg)
                    if connected_data.get("type") != "connected":
                        logger.warning(
                            "Unexpected first message from Gnani STT",
                            extra={"lk.pii.data": connected_data},
                        )

                    send_task = asyncio.create_task(
                        self._send_audio(ws), name="gnani-prisma3-send"
                    )
                    recv_task = asyncio.create_task(
                        self._recv_messages(ws), name="gnani-prisma3-recv"
                    )

                    try:
                        done, _ = await asyncio.wait(
                            [send_task, recv_task],
                            return_when=asyncio.FIRST_COMPLETED,
                        )
                        for task in done:
                            task.result()

                        if send_task.done():
                            # Input audio channel finished normally (session ended)
                            if not recv_task.done():
                                with contextlib.suppress(asyncio.TimeoutError):
                                    await asyncio.wait_for(
                                        asyncio.shield(recv_task), timeout=1.0
                                    )
                            break
                    finally:
                        await utils.aio.gracefully_cancel(send_task, recv_task)

            except websockets.exceptions.ConnectionClosed as e:
                if self._input_ch.closed:
                    break
                logger.info(f"Gnani STT WebSocket closed ({e}); reconnecting immediately...")
                await asyncio.sleep(0.1)
            except asyncio.TimeoutError as e:
                if self._input_ch.closed:
                    break
                raise APITimeoutError(
                    "Gnani Prisma v3.0 WebSocket connection timed out"
                ) from e
            except (APIConnectionError, APIStatusError, APITimeoutError):
                raise
            except Exception as e:
                raise APIConnectionError(
                    f"Gnani Prisma v3.0 WebSocket error: {e}"
                ) from e


class PrismaV3STT(gnani.STT):
    """LiveKit STT plugin upgraded for Gnani Prisma v3.0 streaming."""

    def __init__(
        self,
        *,
        language: str = "indic-auto",
        language_candidates: list[str] | None = None,
        keywords: list[str] | None = None,
        stream_format: str = "codemix",
        model: str = "prisma-v3.0",
        api_key: str | None = None,
        sample_rate: int = 16000,
    ) -> None:
        # Pass a valid literal ("en-IN") to parent init, then set actual language
        super().__init__(
            language="en-IN",
            api_key=api_key,
            sample_rate=sample_rate,
            use_streaming=True,
        )
        self._opts.language = language
        self._prisma_model = model
        self._language_candidates = language_candidates
        self._keywords = keywords
        self._stream_format = stream_format

    def stream(
        self,
        *,
        language: NotGivenOr[str] = NOT_GIVEN,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> PrismaV3SpeechStream:
        return PrismaV3SpeechStream(
            stt_instance=self,
            opts=self._opts,
            conn_options=conn_options,
            model=self._prisma_model,
            language_candidates=self._language_candidates,
            keywords=self._keywords,
            stream_format=self._stream_format,
        )

