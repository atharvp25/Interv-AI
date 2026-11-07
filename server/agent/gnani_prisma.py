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
import uuid
from typing import Any

import websockets
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

    async def _run(self) -> None:
        ws_url = self._build_ws_url()
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

                    if send_task.done() and not recv_task.done():
                        with contextlib.suppress(asyncio.TimeoutError):
                            await asyncio.wait_for(
                                asyncio.shield(recv_task), timeout=1.0
                            )
                finally:
                    await utils.aio.gracefully_cancel(send_task, recv_task)

        except websockets.exceptions.ConnectionClosed as e:
            raise APIConnectionError(
                f"Gnani Prisma v3.0 WebSocket closed unexpectedly: {e}"
            ) from e
        except asyncio.TimeoutError as e:
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
            conn_options=self._single_attempt(conn_options),
            model=self._prisma_model,
            language_candidates=self._language_candidates,
            keywords=self._keywords,
            stream_format=self._stream_format,
        )

