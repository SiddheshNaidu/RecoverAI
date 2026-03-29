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

_SUPPORTED_MIME_PREFIXES = (
    "audio/webm",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "audio/mp3",
)


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


def _audio_file_fields(audio_bytes: bytes, content_type: str | None) -> tuple[str, bytes, str]:
    """Browser mics often produce webm/opus — Sarvam accepts common audio MIME types."""
    ct = (content_type or "").split(";")[0].strip().lower()
    if "webm" in ct:
        return ("audio.webm", audio_bytes, "audio/webm")
    if "ogg" in ct:
        return ("audio.ogg", audio_bytes, ct or "audio/ogg")
    if "mp4" in ct or "m4a" in ct:
        return ("audio.m4a", audio_bytes, ct or "audio/mp4")
    if "mpeg" in ct or "mp3" in ct:
        return ("audio.mp3", audio_bytes, ct or "audio/mpeg")
    if "wav" in ct:
        return ("audio.wav", audio_bytes, "audio/wav")
    return ("audio.wav", audio_bytes, "audio/wav")


def _is_supported_content_type(content_type: str | None) -> bool:
    ct = (content_type or "").split(";")[0].strip().lower()
    if not ct:
        return True
    return any(ct.startswith(prefix) for prefix in _SUPPORTED_MIME_PREFIXES)


def _extract_transcript(body: Any) -> str:
    if not isinstance(body, dict):
        return ""
    if "error" in body:
        return ""
    t = body.get("transcript")
    return t if isinstance(t, str) else ""


async def transcribe(
    audio_bytes: bytes, language: str = "hi", content_type: str | None = None
) -> str:
    meta = await transcribe_with_meta(audio_bytes, language, content_type)
    return str(meta.get("transcript") or "")


async def transcribe_with_meta(
    audio_bytes: bytes, language: str = "hi", content_type: str | None = None
) -> dict[str, Any]:
    try:
        if not audio_bytes:
            return {"transcript": "", "error": "No audio content received."}

        if not _is_supported_content_type(content_type):
            return {
                "transcript": "",
                "error": "Unsupported audio format. Use webm, wav, ogg, m4a, or mp3.",
            }

        api_key = os.getenv("SARVAM_API_KEY", "").strip()
        if not api_key:
            logger.error("Sarvam STT: SARVAM_API_KEY is missing or empty")
            return {
                "transcript": "",
                "error": "SARVAM_API_KEY is missing on backend.",
            }

        headers = {"api-subscription-key": api_key}
        data = {
            "model": "saaras:v3",
            "mode": "transcribe",
            "language_code": _language_code(language),
        }
        fname, body, mime = _audio_file_fields(audio_bytes, content_type)
        files = {"file": (fname, body, mime)}

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
            return {
                "transcript": "",
                "error": f"Sarvam STT failed with HTTP {response.status_code}",
            }

        try:
            payload = response.json()
        except Exception as exc:  # noqa: BLE001 — never raise from transcribe
            logger.error("Sarvam STT: invalid JSON response: %s", exc)
            return {"transcript": "", "error": "Sarvam returned invalid JSON."}

        text = _extract_transcript(payload)
        if not text and isinstance(payload, dict) and payload.get("error"):
            err = payload["error"]
            msg = err.get("message", err) if isinstance(err, dict) else err
            logger.error("Sarvam STT API error: %s", msg)
            return {"transcript": "", "error": str(msg)}
        if not text:
            return {
                "transcript": "",
                "error": "Sarvam did not return any transcript text.",
            }
        return {"transcript": text, "error": ""}
    except Exception as exc:  # noqa: BLE001 — contract: always return str
        logger.exception("Sarvam STT request failed: %s", exc)
        return {
            "transcript": "",
            "error": "Sarvam request failed. Please retry or use text check-in.",
        }
