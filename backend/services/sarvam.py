"""Sarvam AI speech-to-text client (async httpx)."""

from __future__ import annotations

import logging
import os
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"

# Short language codes → BCP-47 codes supported by Sarvam STT (see Sarvam REST docs).
_LANGUAGE_ALIASES: dict[str, str] = {
    "hi": "hi-IN",
    "en": "en-IN",
    "bn": "bn-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "mr": "mr-IN",
    "od": "od-IN",
    "or": "od-IN",
    "pa": "pa-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "gu": "gu-IN",
}


def mock_transcribe() -> str:
    return (
        "मेरे दादाजी कहते थे कि नीम के पत्तों को पानी में उबालकर\n"
        "फसलों पर छिड़कने से कीड़े नहीं लगते। यह पूरी तरह प्राकृतिक है।"
    )


def _language_code(language: str) -> str:
    raw = (language or "hi").strip()
    lower = raw.lower()
    if "-" in raw:
        return raw
    return _LANGUAGE_ALIASES.get(lower, f"{lower}-IN")


def _extract_transcript(body: Any) -> str:
    if not isinstance(body, dict):
        return ""
    if "error" in body:
        return ""
    t = body.get("transcript")
    return t if isinstance(t, str) else ""


async def transcribe(audio_bytes: bytes, language: str = "hi") -> str:
    try:
        if not audio_bytes:
            return ""

        api_key = os.getenv("SARVAM_API_KEY", "").strip()
        if not api_key:
            logger.error("Sarvam STT: SARVAM_API_KEY is missing or empty")
            return ""

        headers = {"api-subscription-key": api_key}
        data = {
            "model": "saaras:v3",
            "mode": "transcribe",
            "language_code": _language_code(language),
        }
        files = {
            "file": (
                "audio.wav",
                audio_bytes,
                "audio/wav",
            )
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
            response = await client.post(
                SARVAM_STT_URL,
                headers=headers,
                data=data,
                files=files,
            )

        if response.status_code != 200:
            logger.error(
                "Sarvam STT failed: HTTP %s — %s",
                response.status_code,
                response.text[:500],
            )
            return ""

        try:
            payload = response.json()
        except Exception as exc:  # noqa: BLE001 — never raise from transcribe
            logger.error("Sarvam STT: invalid JSON response: %s", exc)
            return ""

        text = _extract_transcript(payload)
        if not text and isinstance(payload, dict) and payload.get("error"):
            err = payload["error"]
            msg = err.get("message", err) if isinstance(err, dict) else err
            logger.error("Sarvam STT API error: %s", msg)
        return text
    except Exception as exc:  # noqa: BLE001 — contract: always return str
        logger.exception("Sarvam STT request failed: %s", exc)
        return ""
